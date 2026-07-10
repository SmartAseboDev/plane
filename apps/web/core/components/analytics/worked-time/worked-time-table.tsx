/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Download } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import type { TAnalyticsFilterParams, WorklogStatsRow } from "@plane/types";
// hooks
import { useAnalytics } from "@/hooks/store/use-analytics";
// services
import { AnalyticsService } from "@/services/analytics.service";

const analyticsService = new AnalyticsService();

const rowLabel = (row: WorklogStatsRow) =>
  row.logged_by__display_name ||
  `${row.logged_by__first_name ?? ""} ${row.logged_by__last_name ?? ""}`.trim() ||
  row.logged_by__email ||
  "Unknown user";

export const WorkedTimeTable = observer(function WorkedTimeTable() {
  // router
  const params = useParams();
  const workspaceSlug = params.workspaceSlug?.toString();
  // store
  const { selectedProjects, selectedCycle } = useAnalytics();
  // local filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filterParams: TAnalyticsFilterParams = {
    ...(selectedProjects?.length ? { project_ids: selectedProjects.join(",") } : {}),
    ...(selectedCycle ? { cycle_id: selectedCycle } : {}),
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
  };

  const { data, isLoading } = useSWR(
    workspaceSlug
      ? `WORKLOG_STATS_${workspaceSlug}_${selectedProjects?.join(",")}_${selectedCycle}_${startDate}_${endDate}`
      : null,
    workspaceSlug ? () => analyticsService.getWorklogStats(workspaceSlug, filterParams) : null
  );

  const rows = data?.stats ?? [];

  const handleExport = (format: "csv" | "xlsx") => {
    if (!workspaceSlug) return;
    const url = analyticsService.getWorklogStatsExportUrl(workspaceSlug, format, filterParams);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.rel = "noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="worked-time-from" className="text-xs text-secondary">
              From
            </label>
            <input
              id="worked-time-from"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm rounded border border-subtle bg-transparent px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="worked-time-to" className="text-xs text-secondary">
              To
            </label>
            <input
              id="worked-time-to"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm rounded border border-subtle bg-transparent px-2 py-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            prependIcon={<Download className="size-3.5" />}
            onClick={() => handleExport("csv")}
            disabled={rows.length === 0}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            prependIcon={<Download className="size-3.5" />}
            onClick={() => handleExport("xlsx")}
            disabled={rows.length === 0}
          >
            Excel
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-subtle">
        <table className="text-sm w-full">
          <thead>
            <tr className="border-b border-subtle text-left text-secondary">
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Hours</th>
              <th className="px-4 py-2 text-right font-medium">Entries</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-secondary">
                  No time logged for the selected filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.logged_by_id} className="border-b border-subtle last:border-0">
                  <td className="px-4 py-2">{rowLabel(row)}</td>
                  <td className="px-4 py-2 font-medium text-primary">{row.duration_display}</td>
                  <td className="px-4 py-2 text-right">{row.entry_count}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-subtle font-medium">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-primary">{data?.total_display}</td>
                <td className="px-4 py-2 text-right">{data?.total_entries}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
});
