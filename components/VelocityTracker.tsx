"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { fmtDuration, fmtDate } from "@/lib/utils";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

type Props = {
  completedIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null }>;
};

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCompletionDates(
  completedIds: Set<string>,
  stepRows: Map<string, { completed_at: string | null }>
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

function weekLabel(weekIndex: number): string {
  return `W${weekIndex + 1}`;
}

export function VelocityTracker({ completedIds, stepRows }: Props) {
  const completedCount = completedIds.size;

  const metrics = useMemo(() => {
    const dates = getCompletionDates(completedIds, stepRows);
    if (dates.length === 0) return null;

    const now = new Date();
    const first = dates[0];
    const weeksElapsed = weeksBetween(first, now);

    // Steps per week
    const stepsPerWeek = completedCount / weeksElapsed;

    // Count completions in last 7 days
    const sevenDaysAgo = new Date(now.getTime() - MS_PER_WEEK);
    const recentCount = dates.filter((d) => d >= sevenDaysAgo).length;
    const recentRate = recentCount; // per week (last 7 days = 1 week)
    const trendUp = recentRate > stepsPerWeek;

    // Average gap between consecutive completions
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push(dates[i].getTime() - dates[i - 1].getTime());
    }
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    const lastGap = gaps.length > 0 ? gaps[gaps.length - 1] : 0;
    const gettingFaster = gaps.length > 0 && lastGap < avgGap;

    // Estimated completion
    const remaining = 34 - completedCount;
    const weeksNeeded = stepsPerWeek > 0 ? remaining / stepsPerWeek : Infinity;
    const estDate = new Date(now.getTime() + weeksNeeded * MS_PER_WEEK);

    // Weekly buckets for sparkline
    const totalWeeks = Math.max(1, Math.ceil(weeksBetween(first, now)));
    const buckets: number[] = new Array(totalWeeks).fill(0);
    for (const d of dates) {
      const weekIdx = Math.min(
        Math.floor((d.getTime() - first.getTime()) / MS_PER_WEEK),
        totalWeeks - 1
      );
      buckets[weekIdx]++;
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
        className="rounded-xl bg-surface p-6 text-center"
      >
        <p className="text-sm text-text-muted">
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

  const chartData = {
    labels: buckets.map((_, i) => weekLabel(i)),
    datasets: [
      {
        data: buckets,
        backgroundColor: "#2563EB",
        borderRadius: 4,
        borderSkipped: false as const,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: true },
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "#94a3b8" },
        border: { display: false },
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Steps / Week */}
        <div className="rounded-xl bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Steps / Week</p>
          <p className="text-2xl font-semibold tabular-nums">
            {stepsPerWeek.toFixed(1)}
          </p>
          <p className="text-xs mt-1">
            {trendUp ? (
              <span className="text-green-500">↑ trending faster</span>
            ) : (
              <span className="text-amber-500">↓ trending slower</span>
            )}
          </p>
        </div>

        {/* Avg Time / Step */}
        <div className="rounded-xl bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Avg Time / Step</p>
          <p className="text-2xl font-semibold tabular-nums">
            {avgGap > 0 ? fmtDuration(avgGap) : "--"}
          </p>
          <p className="text-xs mt-1">
            {gettingFaster ? (
              <span className="text-green-500">↓ getting faster</span>
            ) : (
              <span className="text-amber-500">↑ getting slower</span>
            )}
          </p>
        </div>

        {/* Est. Completion */}
        <div className="rounded-xl bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Est. Completion</p>
          <p className="text-2xl font-semibold tabular-nums">
            {weeksNeeded !== Infinity
              ? fmtDate(estDate.toISOString())
              : "--"}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {weeksNeeded !== Infinity
              ? `${Math.ceil(weeksNeeded)} weeks out`
              : `${remaining} steps remaining`}
          </p>
        </div>
      </div>

      {/* Velocity Sparkline */}
      <div className="rounded-xl bg-surface p-4">
        <div style={{ height: 80 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </motion.div>
  );
}
