/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUserLite } from "../users";

// Fields a user can set when logging/editing time.
export type TWorklogEditableFields = {
  date: string; // ISO date string (YYYY-MM-DD)
  duration: number; // logged duration in whole minutes
  description: string;
};

export type TWorklog = TWorklogEditableFields & {
  id: string;
  workspace: string;
  project: string;
  issue: string;
  logged_by: string | null;
  logged_by_detail?: IUserLite;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

// keyed by worklog id
export type TWorklogMap = {
  [worklog_id: string]: TWorklog;
};

// keyed by issue id -> ordered worklog ids
export type TWorklogIdMap = {
  [issue_id: string]: string[];
};
