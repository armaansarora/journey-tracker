"use client";

import type { Step, Phase } from "@/lib/steps";
import { PHASES } from "@/lib/steps";
import { StepCard } from "./StepCard";
import { motion } from "framer-motion";

type Props = {
  phase: Phase;
  steps: Step[];
  completedIds: Set<string>;
  currentStepId: string | null;
  blockedIds: Set<string>;
  availableIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null; notes: string }>;
  onToggle: (id: string, next: boolean) => void;
  startIndex: number;
};

export function PhaseSection({
  phase,
  steps,
  completedIds,
  currentStepId,
  blockedIds,
  availableIds,
  stepRows,
  onToggle,
  startIndex,
}: Props) {
  const meta = PHASES[phase];
  const done = steps.filter((s) => completedIds.has(s.id)).length;
  const pct = steps.length > 0 ? (done / steps.length) * 100 : 0;

  return (
    <motion.section
      id={`phase-${phase}`}
      className="scroll-mt-16 rounded-card p-5"
      style={{ backgroundColor: meta.light + "35" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Phase header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          {/* 48px square badge */}
          <span
            className="inline-flex items-center justify-center h-12 w-12 rounded-card text-xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: meta.accent }}
          >
            {phase}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-semibold text-t-primary leading-tight">
              {meta.title}
            </h2>
            <p className="text-[13px] text-t-muted mt-0.5 font-medium">
              {meta.weeks} &middot; {done} of {steps.length} complete
            </p>
          </div>
        </div>

        {/* Progress bar: 6px tall */}
        <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: meta.accent }}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: false }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map((s, i) => {
          const row = stepRows.get(s.id);
          return (
            <StepCard
              key={s.id}
              step={s}
              index={startIndex + i}
              completed={completedIds.has(s.id)}
              isCurrent={currentStepId === s.id}
              isBlocked={blockedIds.has(s.id)}
              isAvailable={availableIds.has(s.id)}
              completedAt={row?.completed_at ?? null}
              completedIds={completedIds}
              notes={row?.notes ?? ""}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
