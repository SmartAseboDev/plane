# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third Party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from .user import UserLiteSerializer
from plane.db.models import IssueWorklog


class IssueWorklogSerializer(BaseSerializer):
    logged_by_detail = UserLiteSerializer(read_only=True, source="logged_by")

    class Meta:
        model = IssueWorklog
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "project",
            "issue",
            "logged_by",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes.")
        return value
