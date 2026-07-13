/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { WorklogStatsRow } from "@plane/types";

// Categorical palette for per-person series (readable in light and dark themes).
export const WORKED_TIME_PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#a855f7",
  "#14b8a6",
];

export const workedTimeColor = (index: number) => WORKED_TIME_PALETTE[index % WORKED_TIME_PALETTE.length];

export const rowLabel = (row: WorklogStatsRow) =>
  row.logged_by__display_name ||
  `${row.logged_by__first_name ?? ""} ${row.logged_by__last_name ?? ""}`.trim() ||
  row.logged_by__email ||
  "Unknown user";

// whole minutes -> decimal hours (2 dp), for charts
export const minutesToHours = (minutes: number) => Number(((minutes || 0) / 60).toFixed(2));
