"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Step, PHASES, STEPS, toolCategory, TOOL_STYLES } from "@/lib/steps";
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
  step, index, completed, isCurrent, isBlocked, isAvailable,
  completedAt, completedIds, notes, onToggle,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASES[step.phase];
  const toolStyle = TOOL_STYLES[toolCategory(step.tool)];

  const leftBorderColor = completed ? "#059669" : phase.accent;

  // Status badge
  let badgeLabel: string;
  let badgeStyle: { color: string; bg: string; border: string };
  if (completed) {
    badgeLabel = "Done";
    badgeStyle = { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" };
  } else if (isBlocked) {
    badgeLabel = "Blocked";
    badgeStyle = { color: "#9CA3AF", bg: "#F3F4F6", border: "#E5E7EB" };
  } else if (isCurrent) {
    badgeLabel = "Up next";
    badgeStyle = { color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE" };
  } else if (isAvailable) {
    badgeLabel = "Ready";
    badgeStyle = { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" };
  } else {
    badgeLabel = "Pending";
    badgeStyle = { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  }

  // Unmet dependencies
  const unmetDeps = step.dependencies.filter((d) => !completedIds.has(d));

  return (
    <motion.div
      layout
      id={`step-${step.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.025, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden rounded-xl border bg-bg transition-[border-color,box-shadow,background-color,opacity,filter] duration-200 ${
        completed
          ? "border-green-border shadow-[0_1px_2px_rgba(5,150,105,0.06)]"
          : isBlocked
          ? "border-border opacity-55 grayscale-[0.3]"
          : "border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] hover:border-[#CBD5E1] hover:shadow-[0_4px_12px_rgba(17,24,39,0.06)]"
      }`}
      style={{ backgroundColor: completed ? "#F6FDF9" : undefined }}
    >
      {/* Left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: leftBorderColor }} />
      {isCurrent && !completed && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: phase.accent }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}
        className="w-full cursor-pointer text-left pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 flex items-center gap-3 sm:gap-4 hover:bg-surface-hover/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        {/* Completion circle / lock */}
        <div
          role="checkbox"
          aria-checked={completed}
          aria-label={isBlocked ? "Step blocked" : completed ? "Mark incomplete" : "Mark complete"}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isBlocked) onToggle(step.id, !completed);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault(); e.stopPropagation();
              if (!isBlocked) onToggle(step.id, !completed);
            }
          }}
          className={`shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 rounded-full ${isBlocked ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <motion.div
            animate={
              completed
                ? { scale: [1, 1.2, 1], backgroundColor: "#059669", borderColor: "#059669" }
                : isBlocked
                ? { scale: 1, backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }
                : isCurrent
                ? { scale: 1, backgroundColor: "var(--bg)", borderColor: phase.accent }
                : { scale: 1, backgroundColor: "var(--bg)", borderColor: "#D1D5DB" }
            }
            transition={{ duration: 0.4, ease: [0.22, 1.2, 0.36, 1] }}
            className="h-10 w-10 rounded-full border-2 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.svg key="check" initial={{ opacity: 0, scale: 0.4, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.4 }} transition={{ duration: 0.25 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : isBlocked ? (
                <motion.svg key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </motion.svg>
              ) : (
                <motion.span key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-semibold tabular-nums" style={{ color: isCurrent ? phase.accent : "#9CA3AF" }}>
                  {index + 1}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Title + week + completion date */}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] sm:text-xs text-text-muted font-semibold uppercase tracking-wider">
            {step.week}
            {completed && completedAt && (
              <span className="text-green font-medium normal-case tracking-normal ml-2">
                Completed {fmtDate(completedAt)}
              </span>
            )}
          </div>
          <div className={`mt-0.5 text-[15px] sm:text-base font-semibold leading-snug ${completed ? "text-text-secondary" : isBlocked ? "text-text-muted" : "text-text-primary"}`}>
            {step.title}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border hidden sm:flex items-center gap-1"
          style={{ color: badgeStyle.color, backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }}
        >
          {isBlocked && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          {badgeLabel}
        </div>

        {/* Chevron */}
        <motion.svg animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pl-5 pr-4 pb-5 sm:pl-6 sm:pr-5 space-y-4">
              {/* Blocked callout */}
              {isBlocked && unmetDeps.length > 0 && (
                <div className="flex gap-2.5 items-start px-3.5 py-3 rounded-r-lg border-l-[3px] bg-[#FEF2F2] border-l-[#DC2626]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#B91C1C] mb-1">Blocked — requires</div>
                    <div className="flex flex-wrap gap-1.5">
                      {unmetDeps.map((depId) => {
                        const dep = STEPS.find((s) => s.id === depId);
                        const depDone = completedIds.has(depId);
                        return (
                          <a key={depId} href={`#step-${depId}`} className={`inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-md border ${depDone ? "bg-green-light border-green-border text-green" : "bg-[#F9FAFB] border-border text-text-secondary hover:border-blue hover:text-blue"} transition-colors`}>
                            {depDone ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              <span className="h-2 w-2 rounded-full border border-current" />
                            )}
                            {dep?.title ?? depId}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tool badge */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Tool</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md border" style={{ color: toolStyle.color, backgroundColor: toolStyle.bg, borderColor: toolStyle.border }}>
                  {step.tool}
                </span>
                {step.monthly_cost > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]">
                    ${step.monthly_cost}/mo
                  </span>
                )}
                {step.one_time_cost > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]">
                    ${step.one_time_cost} one-time
                  </span>
                )}
              </div>

              {/* Instructions */}
              <StepBlocks blocks={step.blocks} />

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Notes */}
              <StepNotes stepId={step.id} initialNotes={notes} />

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Done when */}
              <div className="rounded-lg border p-4 flex gap-3" style={{ backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }}>
                <div className="shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded-full bg-green flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-green mb-1">Done when</div>
                  <div className="text-[14px] text-[#065F46] leading-[1.6]">{step.done_when}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
