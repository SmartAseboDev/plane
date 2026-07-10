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
| `apps/api/plane/authentication/provider/oauth/microsoft.py` | 5 | Entra ID OAuth provider (tenant-scoped) |
| `apps/api/plane/authentication/views/app/microsoft.py` | 5 | Entra initiate + callback endpoints |
| `apps/admin/app/(all)/(dashboard)/authentication/microsoft/page.tsx` | 5 | God-mode Microsoft config page |
| `apps/admin/app/(all)/(dashboard)/authentication/microsoft/form.tsx` | 5 | God-mode credentials form (client id/secret/tenant) |
| `apps/admin/components/authentication/microsoft-config.tsx` | 5 | God-mode provider card (Configure/Edit + toggle) |
| `apps/admin/app/assets/logos/microsoft-logo.svg`, `apps/web/app/assets/logos/microsoft-logo.svg` | 5 | Microsoft logo asset |

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
| `apps/api/plane/authentication/adapter/error.py` | 5 | +2 error codes: `MICROSOFT_NOT_CONFIGURED` (5113), `MICROSOFT_OAUTH_PROVIDER_ERROR` (5116) |
| `apps/api/plane/authentication/adapter/oauth.py` | 5 | +`microsoft` branch in `authentication_error_code()` |
| `apps/api/plane/authentication/urls.py` | 5 | +import + `microsoft/` and `microsoft/callback/` routes |
| `apps/api/plane/authentication/views/__init__.py` | 5 | +import of Microsoft app endpoints |
| `apps/api/plane/license/api/views/instance.py` | 5 | read `IS_MICROSOFT_ENABLED` + expose `is_microsoft_enabled` |
| `apps/api/plane/utils/instance_config_variables/core.py` | 5 | +`microsoft_config_variables` (client id/secret/tenant + `IS_MICROSOFT_ENABLED`) spliced into `core_config_variables` |
| `apps/admin/app/routes.ts` | 5 | +`authentication/microsoft` route |
| `apps/admin/hooks/oauth/core.tsx` | 5 | +`microsoft` entry in auth modes map |
| `apps/admin/hooks/oauth/index.ts` | 5 | +`microsoft` in `availableAuthenticationModes` |
| `apps/web/core/hooks/oauth/core.tsx` | 5 | +"Sign in with Microsoft" button + `isOAuthEnabled` OR-clause |
| `packages/types/src/instance/auth.ts` | 5 | +`microsoft` mode key, `IS_MICROSOFT_ENABLED`, `TInstanceMicrosoftAuthenticationConfigurationKeys`, login medium |
| `packages/types/src/instance/base.ts` | 5 | +`is_microsoft_enabled` on `IInstanceConfig` |

## Objective 5 (Microsoft Entra login) — verification pending

Code complete + type-checked; `/auth/microsoft/` route live. Single-tenant, god-mode-configured,
web-app button only (no Space). Requires: (a) `manage.py configure_instance` to seed the new
config rows, (b) an Azure/Entra App Registration (redirect URI `<host>/auth/microsoft/callback/`),
(c) enter credentials + toggle on in god-mode. No DB migration (config is data rows).

## Pending (later phases)

Not yet touched:
- `apps/web/ce/components/issues/worklog/activity/*` (Obj 1 activity-feed — needs backend to emit worklog activity records)
- Objective 2 (per-person stats + export) and Objective 4 (dashboards)
