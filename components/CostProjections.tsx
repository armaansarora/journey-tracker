"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { fmtCost } from "@/lib/utils";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

type Props = { currentMonthlyBurn: number };

const SCENARIOS = [
  { id: "wati", label: "WhatsApp via WATI", monthly: 129, note: "Phase D" },
  { id: "respondio", label: "Respond.io (alternative)", monthly: 159, note: "Phase D alternative" },
  { id: "retell", label: "Retell Voice AI", monthly: 50, note: "Future" },
  { id: "composio", label: "Composio integrations", monthly: 29, note: "If CLI tools aren't enough" },
  { id: "gotohuman", label: "gotoHuman approvals", monthly: 39, note: "Cut from plan" },
];

export function CostProjections({ currentMonthlyBurn }: Props) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setEnabled((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const additionsTotal = SCENARIOS.filter((s) => enabled.has(s.id)).reduce((a, s) => a + s.monthly, 0);
  const projectedMonthly = currentMonthlyBurn + additionsTotal;
  const projectedYearly = Math.round(projectedMonthly * 12 * 100) / 100;

  const chartData = {
    labels: ["Current", "With additions"],
    datasets: [{
      data: [currentMonthlyBurn, projectedMonthly],
      backgroundColor: ["#2563EB", "#D97706"],
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: { parsed: { x: number | null } }) => fmtCost(ctx.parsed.x ?? 0) + "/mo" } } },
    scales: {
      x: { beginAtZero: true, grid: { color: "#F3F4F6" }, ticks: { color: "#9CA3AF", callback: (v: number | string) => fmtCost(Number(v)) } },
      y: { grid: { display: false }, ticks: { color: "#6B7280", font: { weight: "bold" as const } } },
    },
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left cursor-pointer">
        <h2 className="text-lg font-semibold text-text-primary">Cost Projections</h2>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="mt-4 space-y-3">
              {SCENARIOS.map((s) => {
                const isOn = enabled.has(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-text-primary">{s.label}</span>
                      <span className="text-xs text-text-muted ml-1.5">({s.note})</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-[#B45309]">{fmtCost(s.monthly)}/mo</span>
                      <button type="button" role="switch" aria-checked={isOn} onClick={() => toggle(s.id)}
                        className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors ${isOn ? "bg-blue" : "bg-[#D1D5DB]"}`}>
                        <span className={`pointer-events-none inline-block h-[18px] w-[18px] translate-y-[2px] rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Projected monthly</span>
                  <span className="font-bold text-text-primary tabular-nums">
                    {fmtCost(projectedMonthly)}
                    {additionsTotal > 0 && <span className="ml-2 text-[#B45309] font-semibold">+{fmtCost(additionsTotal)}/mo</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Projected year 1</span>
                  <span className="font-bold text-text-primary tabular-nums">{fmtCost(projectedYearly)}</span>
                </div>
              </div>

              <div className="mt-4" style={{ height: 120 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
