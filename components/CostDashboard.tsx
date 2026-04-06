"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { monthsBetween, fmtCost } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  completedIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null }>;
};

const SERVICE_MAP: Record<string, { label: string; cost: number; color: string }> = {
  a1:  { label: "Google Workspace", cost: 42,   color: "#0F766E" },
  a8:  { label: "Hetzner VPS",      cost: 16,   color: "#059669" },
  a11: { label: "LLM APIs",         cost: 15,   color: "#7C3AED" },
  a13: { label: "Domain",           cost: 1,    color: "#0369A1" },
  a17: { label: "B2",               cost: 0.50, color: "#D97706" },
};

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

  const projectedYear1 = monthlyBurn * 12 + oneTimeTotal;

  /* -- Donut data -- */
  const donutServices = useMemo(() => {
    const services: { label: string; cost: number; color: string }[] = [];
    for (const [id, svc] of Object.entries(SERVICE_MAP)) {
      if (completedIds.has(id)) {
        services.push({ label: svc.label, cost: svc.cost, color: svc.color });
      }
    }
    return services;
  }, [completedIds]);

  /* -- Sparkline data -- */
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

    const points: { date: string; cost: number }[] = [];
    let cumulative = 0;

    points.push({
      date: new Date(costSteps[0].completed_at!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cost: 0,
    });

    for (const step of costSteps) {
      cumulative += step.monthly_cost;
      points.push({
        date: new Date(step.completed_at!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        cost: cumulative,
      });
    }

    return points;
  }, [completedSteps, stepRows]);

  /* -- KPI definitions -- */
  const kpis = [
    { label: "Monthly Burn", value: fmtCost(Math.round(monthlyBurn)) },
    { label: "Total Spent", value: fmtCost(Math.round(totalSpent)) },
    { label: "One-Time Costs", value: fmtCost(Math.round(oneTimeTotal)) },
    { label: "Year 1 Projected", value: fmtCost(Math.round(projectedYear1)) },
  ];

  /* -- Empty state -- */
  if (completedSteps.length === 0) {
    return (
      <p className="text-sm text-t-muted text-center py-10">
        No active services yet.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* -- KPI Cards -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-card p-card"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-t-muted mb-2">
              {kpi.label}
            </p>
            <p className="text-[28px] font-semibold text-t-primary tabular-nums leading-none">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* -- Donut Chart -- */}
      {donutServices.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <PieChart width={180} height={180}>
            <Pie
              data={donutServices}
              dataKey="cost"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              strokeWidth={0}
            >
              {donutServices.map((svc) => (
                <Cell key={svc.label} fill={svc.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${fmtCost(Number(value))}/mo`, ""]}
            />
          </PieChart>

          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {donutServices.map((svc) => (
              <div
                key={svc.label}
                className="flex items-center gap-2 text-[13px]"
              >
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: svc.color }}
                />
                <span className="text-t-secondary">{svc.label}</span>
                <span className="font-medium text-t-primary">
                  {fmtCost(svc.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -- Area Sparkline -- */}
      {sparklineData && (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => [fmtCost(Number(value)), "Rate"]}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#0F766E"
              strokeWidth={1.5}
              fill="url(#costFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
