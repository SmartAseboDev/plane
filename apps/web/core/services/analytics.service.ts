/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import { API_BASE_URL } from "@plane/constants";
import type {
  IAnalyticsResponse,
  TAnalyticsTabsBase,
  TAnalyticsGraphsBase,
  TAnalyticsFilterParams,
  WorklogStatsResponse,
} from "@plane/types";
// services
import { APIService } from "./api.service";

export class AnalyticsService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getAdvanceAnalytics<T extends IAnalyticsResponse>(
    workspaceSlug: string,
    tab: TAnalyticsTabsBase,
    params?: TAnalyticsFilterParams,
    isPeekView?: boolean
  ): Promise<T> {
    return this.get(this.processUrl<TAnalyticsTabsBase>("advance-analytics", workspaceSlug, tab, params, isPeekView), {
      params: {
        tab,
        ...params,
      },
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getAdvanceAnalyticsStats<T>(
    workspaceSlug: string,
    tab: Exclude<TAnalyticsTabsBase, "overview">,
    params?: TAnalyticsFilterParams,
    isPeekView?: boolean
  ): Promise<T> {
    const processedUrl = this.processUrl<Exclude<TAnalyticsTabsBase, "overview">>(
      "advance-analytics-stats",
      workspaceSlug,
      tab,
      params,
      isPeekView
    );
    return this.get(processedUrl, {
      params: {
        type: tab,
        ...params,
      },
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getAdvanceAnalyticsCharts<T>(
    workspaceSlug: string,
    tab: TAnalyticsGraphsBase,
    params?: TAnalyticsFilterParams,
    isPeekView?: boolean
  ): Promise<T> {
    const processedUrl = this.processUrl<TAnalyticsGraphsBase>(
      "advance-analytics-charts",
      workspaceSlug,
      tab,
      params,
      isPeekView
    );
    return this.get(processedUrl, {
      params: {
        type: tab,
        ...params,
      },
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getWorklogStats(workspaceSlug: string, params?: TAnalyticsFilterParams): Promise<WorklogStatsResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/worklog-stats/`, { params })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  getWorklogStatsExportUrl(workspaceSlug: string, format: "csv" | "xlsx", params?: TAnalyticsFilterParams): string {
    const query = new URLSearchParams({ format });
    if (params?.project_ids) query.set("project_ids", params.project_ids);
    if (params?.cycle_id) query.set("cycle_id", params.cycle_id);
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    return `${API_BASE_URL}/api/workspaces/${workspaceSlug}/worklog-stats/export/?${query.toString()}`;
  }

  processUrl<_T extends string>(
    endpoint: string,
    workspaceSlug: string,
    tab: TAnalyticsGraphsBase | TAnalyticsTabsBase,
    params?: TAnalyticsFilterParams,
    isPeekView?: boolean
  ) {
    let processedUrl = `/api/workspaces/${workspaceSlug}`;
    if (isPeekView && (tab === "work-items" || tab === "custom-work-items")) {
      const projectIds = params?.project_ids;
      if (typeof projectIds !== "string" || !projectIds.trim()) {
        throw new Error("project_ids parameter is required for peek view of work items");
      }
      const projectId = projectIds.split(",")[0];
      if (!projectId) {
        throw new Error("Invalid project_ids format - no project ID found");
      }
      processedUrl += `/projects/${projectId}`;
    }
    return `${processedUrl}/${endpoint}`;
  }
}
