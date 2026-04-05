"use client";

import { Step, Phase, PHASES } from "@/lib/steps";
import { StepCard } from "./StepCard";
import { motion } from "framer-motion";

type Props = {
  phase: Phase;
  steps: Step[];
  completedIds: Set<string>;
  onToggle: (id: string, next: boolean) => void;
};

export function PhaseSection({ phase, steps, completedIds, onToggle }: Props) {
  const meta = PHASES[phase];
  const done = steps.filter((s) => completedIds.has(s.id)).length;
  const pct = steps.length > 0 ? (done / steps.length) * 100 : 0;

  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{ backgroundColor: meta.light + "66" }}
    >
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: meta.accent }}
          >
            {phase}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-tight">
              {meta.title}
            </h2>
            <div className="text-xs sm:text-sm text-text-secondary">{meta.weeks}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium text-text-secondary shrink-0 tabular-nums">
            {done} of {steps.length}
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-white border border-border overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ backgroundColor: meta.accent }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <StepCard
            key={s.id}
            step={s}
            index={i}
            completed={completedIds.has(s.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
