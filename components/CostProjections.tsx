"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fmtCost } from "@/lib/utils";

type Props = { currentMonthlyBurn: number };

const SCENARIOS = [
  { id: "wati", label: "WhatsApp via WATI", monthly: 129, note: "Phase D" },
  { id: "respondio", label: "Respond.io", monthly: 159, note: "Phase D alt" },
  { id: "retell", label: "Retell Voice AI", monthly: 50, note: "Future" },
];

const BAR_COLORS = ["#0F766E", "#D97706"];

export function CostProjections({ currentMonthlyBurn }: Props) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const additionsTotal = SCENARIOS.filter((s) => enabled.has(s.id)).reduce(
    (a, s) => a + s.monthly,
    0,
  );
  const projectedMonthly = currentMonthlyBurn + additionsTotal;
  const projectedYearly = Math.round(projectedMonthly * 12 * 100) / 100;

  const chartData = [
    { name: "Current", value: currentMonthlyBurn },
    { name: "Projected", value: projectedMonthly },
  ];

  return (
    <section className="bg-white border border-border rounded-card p-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left cursor-pointer"
      >
        <h2 className="text-lg font-semibold text-t-primary">
          Cost Projections
        </h2>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {SCENARIOS.map((s) => {
                const isOn = enabled.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-t-primary">
                        {s.label}
                      </span>
                      <span className="text-xs text-t-muted ml-1.5">
                        ({s.note})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-warn">
                        {fmtCost(s.monthly)}/mo
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isOn}
                        onClick={() => toggle(s.id)}
                        className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors ${isOn ? "bg-primary" : "bg-[#D1D5DB]"}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-[18px] w-[18px] translate-y-[2px] rounded-full bg-white transition-transform ${isOn ? "translate-x-[20px]" : "translate-x-[2px]"}`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-t-secondary">Projected monthly</span>
                  <span className="font-bold text-t-primary tabular-nums">
                    {fmtCost(projectedMonthly)}
                    {additionsTotal > 0 && (
                      <span className="ml-2 text-warn font-semibold">
                        +{fmtCost(additionsTotal)}/mo
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-t-secondary">Projected year 1</span>
                  <span className="font-bold text-t-primary tabular-nums">
                    {fmtCost(projectedYearly)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={chartData} layout="vertical">
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => fmtCost(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        `${fmtCost(value)}/mo`,
                        "Cost",
                      ]}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                      {chartData.map((entry, i) => (
                        <Cell key={entry.name} fill={BAR_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
