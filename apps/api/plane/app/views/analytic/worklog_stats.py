# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db.models import Count, Sum
from django.http import HttpRequest, HttpResponse

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.permissions import ROLE, allow_permission
from plane.app.views.base import BaseAPIView
from plane.db.models import CycleIssue, IssueWorklog
from plane.utils.date_utils import get_analytics_filters
from plane.utils.porters.formatters import CSVFormatter, XLSXFormatter


def _format_duration(total_minutes):
    minutes = int(total_minutes or 0)
    hours = minutes // 60
    mins = minutes % 60
    if hours and mins:
        return f"{hours}h {mins}m"
    if hours:
        return f"{hours}h"
    return f"{mins}m"


class WorklogStatsBaseView(BaseAPIView):
    """Shared aggregation for per-person worked-time statistics.

    Scoped to the workspace and to projects the requesting user is an active
    member of (via ``get_analytics_filters`` base filters). Supports filtering
    by project ids, a cycle, and an inclusive ``date`` range.
    """

    def get_worklog_stats(self, request: HttpRequest, slug: str):
        project_ids = request.GET.get("project_ids", None)
        cycle_id = request.GET.get("cycle_id", None)
        start_date = request.GET.get("start_date", None)
        end_date = request.GET.get("end_date", None)

        filters = get_analytics_filters(
            slug=slug,
            user=request.user,
            type="chart",
            project_ids=project_ids,
        )

        queryset = IssueWorklog.objects.filter(**filters["base_filters"])

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if cycle_id:
            cycle_issue_ids = CycleIssue.objects.filter(workspace__slug=slug, cycle_id=cycle_id).values_list(
                "issue_id", flat=True
            )
            queryset = queryset.filter(issue_id__in=cycle_issue_ids)

        stats = list(
            queryset.values(
                "logged_by_id",
                "logged_by__display_name",
                "logged_by__first_name",
                "logged_by__last_name",
                "logged_by__email",
            )
            .annotate(total_minutes=Sum("duration"), entry_count=Count("id"))
            .order_by("-total_minutes")
        )
        return stats


class WorklogStatsEndpoint(WorklogStatsBaseView):
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def get(self, request: HttpRequest, slug: str) -> Response:
        stats = self.get_worklog_stats(request, slug)
        total_minutes = sum(row["total_minutes"] or 0 for row in stats)
        total_entries = sum(row["entry_count"] or 0 for row in stats)
        for row in stats:
            row["duration_display"] = _format_duration(row["total_minutes"])
        return Response(
            {
                "stats": stats,
                "total_minutes": total_minutes,
                "total_entries": total_entries,
                "total_display": _format_duration(total_minutes),
            },
            status=status.HTTP_200_OK,
        )


class WorklogStatsExportEndpoint(WorklogStatsBaseView):
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def get(self, request: HttpRequest, slug: str) -> HttpResponse:
        stats = self.get_worklog_stats(request, slug)
        export_format = request.GET.get("format", "csv").lower()

        rows = [
            {
                "user": row["logged_by__display_name"]
                or f"{row['logged_by__first_name'] or ''} {row['logged_by__last_name'] or ''}".strip()
                or row["logged_by__email"]
                or "Unknown user",
                "email": row["logged_by__email"] or "",
                "hours": _format_duration(row["total_minutes"]),
                "total_minutes": row["total_minutes"] or 0,
                "entries": row["entry_count"] or 0,
            }
            for row in stats
        ]

        if export_format == "xlsx":
            content = XLSXFormatter().encode(rows)
            response = HttpResponse(
                content,
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = 'attachment; filename="worked-time.xlsx"'
            return response

        content = CSVFormatter().encode(rows)
        response = HttpResponse(content, content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="worked-time.csv"'
        return response
