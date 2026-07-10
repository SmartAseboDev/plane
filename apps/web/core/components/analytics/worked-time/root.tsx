/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// local
import { WorkedTimeTable } from "./worked-time-table";

export const WorkedTime = observer(function WorkedTime() {
  return (
    <div className="px-6 py-4">
      <h1 className="mb-4 text-20 font-bold md:mb-6">Worked time</h1>
      <WorkedTimeTable />
    </div>
  );
});
