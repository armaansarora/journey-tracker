"use client";

import { useMemo } from "react";
import { monthsBetween, fmtCost } from "@/lib/utils";
import { STEPS } from "@/lib/steps";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Filler,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  Tooltip,
  Filler,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
);

type Props = {
  completedIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null }>;
};

const SERVICE_MAP: Record<string, string> = {
  a1: "Google Workspace",
  a8: "Hetzner VPS",
  a11: "LLM APIs",
  a13: "Domain",
  a17: "Backblaze B2",
};

const DONUT_COLORS = ["#2563EB", "#059669", "#7C3AED", "#0891B2", "#D97706"];

export function CostDashboard({ completedIds, stepRows }: Props) {
  const completedSteps = useMemo(
    () => STEPS.filter((s) => completedIds.has(s.id)),
    [completedIds],
  );

  const monthlyBurn = useMemo(
    () => completedSteps.reduce((sum, s) => sum + s.monthly_cost, 0),
    [completedSteps],
  );

  const oneTimeTotal = useMemo(
    () => completedSteps.reduce((sum, s) => sum + s.one_time_cost, 0),
    [completedSteps],
  );

  const activeServiceCount = useMemo(
    () => completedSteps.filter((s) => s.monthly_cost > 0).length,
    [completedSteps],
  );

  const purchaseCount = useMemo(
    () => completedSteps.filter((s) => s.one_time_cost > 0).length,
    [completedSteps],
  );

  const now = useMemo(() => new Date(), []);

  const totalSpent = useMemo(() => {
    let total = 0;
    for (const step of completedSteps) {
      total += step.one_time_cost;
      if (step.monthly_cost > 0) {
        const row = stepRows.get(step.id);
        if (row?.completed_at) {
          total += monthsBetween(row.completed_at, now) * step.monthly_cost;
        }
      }
    }
    return total;
  }, [completedSteps, stepRows, now]);

  const firstCompletion = useMemo(() => {
    let earliest: string | null = null;
    for (const step of completedSteps) {
      const row = stepRows.get(step.id);
      if (row?.completed_at) {
        if (!earliest || row.completed_at < earliest) {
          earliest = row.completed_at;
        }
      }
    }
    return earliest;
  }, [completedSteps, stepRows]);

  const projectedYear1 = monthlyBurn * 12 + oneTimeTotal;

  // Donut data — only completed services
  const donutServices = useMemo(() => {
    const services: { label: string; cost: number; color: string }[] = [];
    const ids = Object.keys(SERVICE_MAP);
    ids.forEach((id, i) => {
      if (completedIds.has(id)) {
        const step = STEPS.find((s) => s.id === id);
        if (step) {
          services.push({
            label: SERVICE_MAP[id],
            cost: step.monthly_cost,
            color: DONUT_COLORS[i % DONUT_COLORS.length],
          });
        }
      }
    });
    return services;
  }, [completedIds]);

  const donutData = useMemo(
    () => ({
      labels: donutServices.map((s) => s.label),
      datasets: [
        {
          data: donutServices.map((s) => s.cost),
          backgroundColor: donutServices.map((s) => s.color),
          borderWidth: 0,
          cutout: "70%",
        },
      ],
    }),
    [donutServices],
  );

  // Sparkline data — cumulative monthly cost over time
  const sparklineData = useMemo(() => {
    const costSteps = completedSteps
      .filter((s) => s.monthly_cost > 0)
      .map((s) => ({
        ...s,
        completed_at: stepRows.get(s.id)?.completed_at ?? null,
      }))
      .filter((s) => s.completed_at !== null)
      .sort((a, b) => a.completed_at!.localeCompare(b.completed_at!));

    if (costSteps.length === 0) return null;

    const labels: string[] = [];
    const values: number[] = [];
    let cumulative = 0;

    // Start at $0
    labels.push(
      new Date(costSteps[0].completed_at!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    );
    values.push(0);

    for (const step of costSteps) {
      cumulative += step.monthly_cost;
      labels.push(
        new Date(step.completed_at!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      );
      values.push(cumulative);
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [completedSteps, stepRows]);

  const firstDateStr = firstCompletion
    ? new Date(firstCompletion).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const kpis = [
    {
      label: "Monthly Burn",
      value: fmtCost(Math.round(monthlyBurn)),
      sub: `${activeServiceCount} services active`,
    },
    {
      label: "Total Spent",
      value: fmtCost(Math.round(totalSpent)),
      sub: `Since ${firstDateStr}`,
    },
    {
      label: "One-Time Costs",
      value: fmtCost(Math.round(oneTimeTotal)),
      sub: `${purchaseCount} purchases`,
    },
    {
      label: "Projected Year 1",
      value: fmtCost(Math.round(projectedYear1)),
      sub: "At current burn",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#F9FAFB] rounded-xl p-4"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {kpi.label}
            </div>
            <div className="text-2xl font-semibold text-text-primary tabular-nums mt-1">
              {kpi.value}
            </div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="flex flex-col items-center gap-4">
        {donutServices.length > 0 ? (
          <>
            <div className="w-[200px] h-[200px]">
              <Doughnut
                data={donutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (ctx) =>
                          `${ctx.label}: ${fmtCost(ctx.parsed)}/mo`,
                      },
                    },
                  },
                }}
              />
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {donutServices.map((svc) => (
                <div key={svc.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: svc.color }}
                  />
                  <span className="text-sm text-text-secondary">
                    {svc.label}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {fmtCost(svc.cost)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">
            No active services yet. Costs begin when you complete infrastructure
            steps.
          </p>
        )}
      </div>

      {/* Cost Timeline Sparkline */}
      {sparklineData && (
        <div className="h-[120px]">
          <Line
            data={sparklineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: { color: "rgba(0,0,0,0.04)" },
                  ticks: { font: { size: 10 }, color: "#9CA3AF" },
                },
                y: {
                  grid: { color: "rgba(0,0,0,0.04)" },
                  ticks: {
                    font: { size: 10 },
                    color: "#9CA3AF",
                    callback: (v) => `$${v}`,
                  },
                  beginAtZero: true,
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${fmtCost(ctx.parsed?.y ?? 0)}/mo`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
