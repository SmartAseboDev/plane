# Fork change log — files we touch (merge-awareness)

Every edit to one of Plane's own files is a potential future merge conflict on
upgrade. We keep new code in **new files** wherever possible and list every
**core-file** edit here. Base version: **v1.3.1**.

## New files (additive, no merge risk)

| File | Objective | Purpose |
|------|-----------|---------|
| `docs/fork/roadmap-howto.md` | 3 | Roadmap how-to (no code) |
| `docs/fork/CHANGES.md` | — | This tracker |
| `apps/api/plane/db/models/worklog.py` | 1 | `IssueWorklog` model |
| `apps/api/plane/app/serializers/worklog.py` | 1 | `IssueWorklogSerializer` |
| `apps/api/plane/app/views/issue/worklog.py` | 1 | `IssueWorklogViewSet` |
| `apps/api/plane/db/migrations/0122_issueworklog.py` | 1 | Worklog table migration |

## Core files edited (merge-risk — keep minimal)

| File | Objective | Edit |
|------|-----------|------|
| `apps/api/plane/db/models/__init__.py` | 1 | +1 import: `from .worklog import IssueWorklog` |
| `apps/api/plane/app/serializers/__init__.py` | 1 | +1 import: `IssueWorklogSerializer` |
| `apps/api/plane/app/views/__init__.py` | 1 | +1 import: `IssueWorklogViewSet` |
| `apps/api/plane/app/urls/issue.py` | 1 | +1 import + 2 `path()` entries (`.../worklogs/`, `.../worklogs/<pk>/`) |

## Pending (frontend, later phases)

Worklog UI will replace CE stubs (in-place edits, since there is no `ee/` tree):
- `apps/web/ce/components/issues/worklog/property/root.tsx` (sidebar UI)
- possibly `apps/web/ce/components/issues/worklog/activity/*` (activity-feed)
- new service methods in `apps/web/core/services/issue/`
- new MobX store `apps/web/core/store/issue/issue-details/worklog.store.ts`
- store wiring in the issue-detail root store (core edit — to be logged here)
