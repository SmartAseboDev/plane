/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// plane imports
import { BarChart } from "@plane/propel/charts/bar-chart";
import { PieChart } from "@plane/propel/charts/pie-chart";
import type { WorklogStatsRow } from "@plane/types";
// local
import { minutesToHours, rowLabel, workedTimeColor } from "./utils";

type Props = {
  stats: WorklogStatsRow[];
};

export const WorkedTimeCharts = observer(function WorkedTimeCharts(props: Props) {
  const { stats } = props;

  if (!stats.length) return null;

  const barData = stats.map((row, index) => ({
    name: rowLabel(row),
    hours: minutesToHours(row.total_minutes),
    color: workedTimeColor(index),
  }));

  const pieData = stats.map((row, index) => ({
    key: row.logged_by_id,
    name: rowLabel(row),
    value: minutesToHours(row.total_minutes),
    color: workedTimeColor(index),
  }));

  const cells = stats.map((row, index) => ({
    key: row.logged_by_id,
    fill: workedTimeColor(index),
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-subtle p-4">
        <h3 className="text-sm mb-3 font-medium text-secondary">Hours by person</h3>
        <BarChart
          className="h-[320px] w-full"
          data={barData}
          bars={[
            {
              key: "hours",
              label: "Hours",
              fill: (payload: { color?: string }) => payload?.color ?? workedTimeColor(0),
              textClassName: "",
              stackId: "worked-time",
            },
          ]}
          xAxis={{ key: "name" }}
          yAxis={{ key: "hours", label: "Hours", allowDecimals: true }}
          showTooltip
        />
      </div>
      <div className="rounded-lg border border-subtle p-4">
        <h3 className="text-sm mb-3 font-medium text-secondary">Share of total</h3>
        <PieChart
          className="h-[320px] w-full"
          data={pieData}
          dataKey="value"
          cells={cells}
          innerRadius="55%"
          paddingAngle={4}
          cornerRadius={4}
          showLabel={false}
          showTooltip
          tooltipLabel="Hours"
        />
      </div>
    </div>
  );
});
