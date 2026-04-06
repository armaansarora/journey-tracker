"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Step } from "@/lib/steps";
import { PHASES, STEPS, toolCategory, TOOL_STYLES } from "@/lib/steps";
import { StepBlocks } from "./StepBlocks";
import { StepNotes } from "./StepNotes";
import { fmtDate } from "@/lib/utils";

type Props = {
  step: Step;
  index: number;
  completed: boolean;
  isCurrent: boolean;
  isBlocked: boolean;
  isAvailable: boolean;
  completedAt: string | null;
  completedIds: Set<string>;
  notes: string;
  onToggle: (id: string, next: boolean) => void;
};

export function StepCard({
  step,
  index,
  completed,
  isCurrent,
  isBlocked,
  isAvailable,
  completedAt,
  completedIds,
  notes,
  onToggle,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASES[step.phase];
  const cat = toolCategory(step.tool);
  const toolStyle = TOOL_STYLES[cat];

  const accentColor = completed ? "#059669" : phase.accent;

  const borderClass = completed
    ? "border-success-border bg-[#FAFFF9]"
    : isBlocked
      ? "border-border opacity-50 grayscale-[0.3]"
      : "border-border hover:border-[#CBD5E1]";

  // Resolve dependency steps
  const depSteps = step.dependencies
    .map((id) => STEPS.find((s) => s.id === id))
    .filter(Boolean) as Step[];
  const hasUnmetDeps = isBlocked && depSteps.length > 0;

  return (
    <div
      id={`step-${step.id}`}
      className={`relative rounded-card border bg-white transition-[border-color,opacity,filter] duration-200 ${borderClass}`}
    >
      {/* 3px left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-card"
        style={{ backgroundColor: accentColor }}
      />

      {/* Collapsed row */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-surface"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        aria-expanded={expanded}
      >
        {/* Circle (36px, border-2) */}
        <button
          type="button"
          aria-label={isBlocked ? "Step blocked" : completed ? "Mark incomplete" : "Mark complete"}
          disabled={isBlocked}
          className={`flex-shrink-0 focus:outline-none ${isBlocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isBlocked) onToggle(step.id, !completed);
          }}
        >
          {completed ? (
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-success bg-success"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          ) : isBlocked ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D1D5DB] bg-[#F1F5F9]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
          ) : isCurrent ? (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white"
              style={{ borderColor: phase.accent }}
            >
              <span className="text-xs font-semibold" style={{ color: phase.accent }}>
                {index + 1}
              </span>
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D1D5DB] bg-white">
              <span className="text-xs font-semibold text-t-muted">{index + 1}</span>
            </div>
          )}
        </button>

        {/* Title area */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-t-muted">
              {step.week}
            </span>
            {completed && completedAt && (
              <span className="text-[11px] font-medium text-success">
                &middot; Completed {fmtDate(completedAt)}
              </span>
            )}
          </div>
          <p className="text-[15px] font-semibold text-t-primary leading-snug truncate mt-0.5">
            {step.title}
          </p>
        </div>

        {/* Status badge (hidden sm:flex) */}
        <div className="hidden sm:flex flex-shrink-0">
          {completed ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-light px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-success">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </span>
          ) : isBlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-t-muted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Blocked
            </span>
          ) : isCurrent ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary-light px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-primary">
              Up next
            </span>
          ) : isAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-t-muted">
              Ready
            </span>
          ) : null}
        </div>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5">
              {/* 1. Blocked callout */}
              {hasUnmetDeps && (
                <div className="rounded-r-sm border-l-[3px] border-l-error bg-error-light px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-error mb-1">
                    Blocked
                  </p>
                  <p className="text-[13.5px] text-t-secondary mb-2">
                    Complete these steps first:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {depSteps.map((dep) => {
                      const done = completedIds.has(dep.id);
                      return (
                        <a
                          key={dep.id}
                          href={`#step-${dep.id}`}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors duration-200 ${
                            done
                              ? "border-success-border bg-success-light text-success"
                              : "border-border bg-[#F1F5F9] text-t-secondary hover:border-[#CBD5E1]"
                          }`}
                        >
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="8" />
                            </svg>
                          )}
                          {dep.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Tool pill + cost pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                  style={{
                    color: toolStyle.color,
                    backgroundColor: toolStyle.bg,
                    borderColor: toolStyle.border,
                  }}
                >
                  {step.tool}
                </span>
                {step.monthly_cost > 0 && (
                  <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-t-secondary">
                    ${step.monthly_cost}/mo
                  </span>
                )}
                {step.one_time_cost > 0 && (
                  <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-t-secondary">
                    ${step.one_time_cost} one-time
                  </span>
                )}
              </div>

              {/* 3. Step blocks */}
              <StepBlocks blocks={step.blocks} />

              {/* 4. Hairline */}
              <hr className="border-border" />

              {/* 5. Notes */}
              <StepNotes stepId={step.id} initialNotes={notes} />

              {/* 6. Hairline */}
              <hr className="border-border" />

              {/* 7. Done-when box */}
              <div className="rounded-sm border border-success-border bg-success-light p-4">
                <div className="flex items-start gap-2.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="flex-shrink-0 mt-0.5 text-success"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-success mb-1">
                      Done when
                    </p>
                    <p className="text-[13.5px] text-t-secondary leading-[1.6]">
                      {step.done_when}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
