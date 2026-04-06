"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { fmtDuration, fmtDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  completedIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null }>;
};

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCompletionDates(
  completedIds: Set<string>,
  stepRows: Map<string, { completed_at: string | null }>,
): Date[] {
  const dates: Date[] = [];
  for (const id of completedIds) {
    const row = stepRows.get(id);
    if (row?.completed_at) {
      dates.push(new Date(row.completed_at));
    }
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function weeksBetween(from: Date, to: Date): number {
  return Math.max((to.getTime() - from.getTime()) / MS_PER_WEEK, 1 / 7);
}

export function VelocityTracker({ completedIds, stepRows }: Props) {
  const completedCount = completedIds.size;

  const metrics = useMemo(() => {
    const dates = getCompletionDates(completedIds, stepRows);
    if (dates.length === 0) return null;

    const now = new Date();
    const first = dates[0];
    const weeksElapsed = weeksBetween(first, now);

    const stepsPerWeek = completedCount / weeksElapsed;

    const sevenDaysAgo = new Date(now.getTime() - MS_PER_WEEK);
    const recentCount = dates.filter((d) => d >= sevenDaysAgo).length;
    const recentRate = recentCount;
    const trendUp = recentRate > stepsPerWeek;

    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push(dates[i].getTime() - dates[i - 1].getTime());
    }
    const avgGap =
      gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    const lastGap = gaps.length > 0 ? gaps[gaps.length - 1] : 0;
    const gettingFaster = gaps.length > 0 && lastGap < avgGap;

    const remaining = 34 - completedCount;
    const weeksNeeded = stepsPerWeek > 0 ? remaining / stepsPerWeek : Infinity;
    const estDate = new Date(now.getTime() + weeksNeeded * MS_PER_WEEK);

    const totalWeeks = Math.max(1, Math.ceil(weeksBetween(first, now)));
    const buckets: { week: string; count: number }[] = [];
    const raw = new Array(totalWeeks).fill(0);
    for (const d of dates) {
      const weekIdx = Math.min(
        Math.floor((d.getTime() - first.getTime()) / MS_PER_WEEK),
        totalWeeks - 1,
      );
      raw[weekIdx]++;
    }
    for (let i = 0; i < totalWeeks; i++) {
      buckets.push({ week: `W${i + 1}`, count: raw[i] });
    }

    return {
      stepsPerWeek,
      trendUp,
      avgGap,
      gettingFaster,
      remaining,
      weeksNeeded,
      estDate,
      buckets,
    };
  }, [completedIds, stepRows, completedCount]);

  if (!metrics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-center"
      >
        <p className="text-sm text-[#9CA3AF]">
          Start a step to see projections
        </p>
      </motion.div>
    );
  }

  const {
    stepsPerWeek,
    trendUp,
    avgGap,
    gettingFaster,
    remaining,
    weeksNeeded,
    estDate,
    buckets,
  } = metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Steps / Week */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Steps / Week
          </p>
          <p className="text-2xl font-semibold text-[#111827] tabular-nums">
            {stepsPerWeek.toFixed(1)}
          </p>
          <p className="text-[12px] text-[#6B7280] mt-1">
            {trendUp ? (
              <span className="text-[#059669]">&#8593; trending faster</span>
            ) : (
              <span className="text-[#D97706]">&#8595; trending slower</span>
            )}
          </p>
        </div>

        {/* Avg Time / Step */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Avg Time / Step
          </p>
          <p className="text-2xl font-semibold text-[#111827] tabular-nums">
            {avgGap > 0 ? fmtDuration(avgGap) : "--"}
          </p>
          <p className="text-[12px] text-[#6B7280] mt-1">
            {gettingFaster ? (
              <span className="text-[#059669]">&#8595; getting faster</span>
            ) : (
              <span className="text-[#D97706]">&#8593; getting slower</span>
            )}
          </p>
        </div>

        {/* Est. Completion */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Est. Completion
          </p>
          <p className="text-2xl font-semibold text-[#111827] tabular-nums">
            {weeksNeeded !== Infinity
              ? fmtDate(estDate.toISOString())
              : "--"}
          </p>
          <p className="text-[12px] text-[#6B7280] mt-1">
            {weeksNeeded !== Infinity
              ? `${Math.ceil(weeksNeeded)} weeks out`
              : `${remaining} steps remaining`}
          </p>
        </div>
      </div>

      {/* Velocity Bar Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={buckets}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => [`${Number(value)} steps`, "Completed"]}
            />
            <Bar
              dataKey="count"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
