# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import models

# Module imports
from .project import ProjectBaseModel


class IssueWorklog(ProjectBaseModel):
    """Time logged by a user against a work item (issue).

    Duration is stored in whole minutes. ``logged_by`` records who the time is
    attributed to (defaults to the acting user on create) and is kept distinct
    from ``created_by`` so attribution survives even if a different user edits
    the entry.
    """

    issue = models.ForeignKey("db.Issue", on_delete=models.CASCADE, related_name="worklogs")
    logged_by = models.ForeignKey(
        "db.User",
        on_delete=models.SET_NULL,
        related_name="issue_worklogs",
        null=True,
    )
    date = models.DateField()
    duration = models.PositiveIntegerField(help_text="Logged duration in minutes")
    description = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Issue Worklog"
        verbose_name_plural = "Issue Worklogs"
        db_table = "issue_worklogs"
        ordering = ("-date", "-created_at")

    def __str__(self):
        return f"{self.issue_id} <{self.duration}m>"
