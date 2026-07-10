/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// Format a duration in whole minutes as a compact "Xh Ym" string.
export const formatWorklogDuration = (totalMinutes: number): string => {
  const minutes = Math.max(0, Math.trunc(totalMinutes || 0));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};
