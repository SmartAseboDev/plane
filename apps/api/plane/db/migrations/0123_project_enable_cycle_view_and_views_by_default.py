# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0122_issueworklog"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="cycle_view",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="project",
            name="issue_views_view",
            field=models.BooleanField(default=True),
        ),
    ]
