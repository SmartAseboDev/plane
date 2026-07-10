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
| `packages/types/src/issues/worklog.ts` | 1 | `TWorklog` frontend types |
| `apps/web/core/services/issue/worklog.service.ts` | 1 | `WorklogService` (REST calls) |
| `apps/web/core/store/issue/issue-details/worklog.store.ts` | 1 | `IssueWorklogStore` (MobX) |
| `apps/web/ce/components/issues/worklog/create-update-worklog-modal.tsx` | 1 | Log/edit time modal |
| `apps/web/ce/components/issues/worklog/helper.ts` | 1 | Duration formatter |

## Core files edited (merge-risk — keep minimal)

| File | Objective | Edit |
|------|-----------|------|
| `apps/api/plane/db/models/__init__.py` | 1 | +1 import: `from .worklog import IssueWorklog` |
| `apps/api/plane/app/serializers/__init__.py` | 1 | +1 import: `IssueWorklogSerializer` |
| `apps/api/plane/app/views/__init__.py` | 1 | +1 import: `IssueWorklogViewSet` |
| `apps/api/plane/app/urls/issue.py` | 1 | +1 import + 2 `path()` entries (`.../worklogs/`, `.../worklogs/<pk>/`) |
| `packages/types/src/issues/base.ts` | 1 | +1 barrel export: `export * from "./worklog"` |
| `apps/web/core/services/issue/index.ts` | 1 | +1 barrel export: `worklog.service` |
| `apps/web/ce/components/issues/worklog/property/root.tsx` | 1 | Replaced empty CE stub with real sidebar panel (list/total/add/edit/delete). Same export name `IssueWorklogProperty`. |
| `apps/web/core/store/issue/issue-details/root.store.ts` | 1 | Register `worklog` store; add `isWorklogModalOpen` + `toggleWorklogModal` and include in `isAnyModalOpen` (so peek panel doesn't close under the modal) |

## Pending (frontend, later phases)

Not yet touched (worklog UI is sidebar-only for now):
- `apps/web/ce/components/issues/worklog/activity/*` (activity-feed integration — needs backend to emit worklog activity records)
- Objective 2 (per-person stats + export) and Objective 4 (dashboards)
