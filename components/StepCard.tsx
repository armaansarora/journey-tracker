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

  // Status badge config
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
  } else {
    badgeLabel = "Ready";
    badgeStyle = { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" };
  }

  // Unmet dependencies
  const unmetDeps = step.dependencies.filter((d) => !completedIds.has(d));

  return (
    <div
      id={`step-${step.id}`}
      className={`relative overflow-hidden rounded-xl border transition-[border-color,opacity,filter] duration-200 ${
        completed
          ? "border-[#A7F3D0] bg-[#FAFFF9]"
          : isBlocked
          ? "border-[#E5E7EB] opacity-55 grayscale-[0.3] bg-white"
          : "border-[#E5E7EB] hover:border-[#CBD5E1] bg-white"
      }`}
    >
      {/* Left accent bar — 3px */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: leftBorderColor }}
      />

      {/* Collapsed row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        {/* Completion circle */}
        <div
          role="checkbox"
          aria-checked={completed}
          aria-label={isBlocked ? "Step blocked" : completed ? "Mark incomplete" : "Mark complete"}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isBlocked) return;
            onToggle(step.id, !completed);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              if (isBlocked) return;
              onToggle(step.id, !completed);
            }
          }}
          className={`shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded-full ${
            isBlocked ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <motion.div
            animate={
              completed
                ? { scale: [1, 1.15, 1], backgroundColor: "#059669", borderColor: "#059669" }
                : isBlocked
                ? { scale: 1, backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }
                : isCurrent
                ? { scale: 1, backgroundColor: "#FFFFFF", borderColor: phase.accent }
                : { scale: 1, backgroundColor: "#FFFFFF", borderColor: "#D1D5DB" }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2"
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.svg
                  key="check"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.2 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : isBlocked ? (
                <motion.svg
                  key="lock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </motion.svg>
              ) : (
                <motion.span
                  key="num"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: isCurrent ? phase.accent : "#9CA3AF" }}
                >
                  {index + 1}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Title area */}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            {step.week}
            {completed && completedAt && (
              <span className="ml-2 font-medium normal-case tracking-normal text-[#059669]">
                &middot; Completed {fmtDate(completedAt)}
              </span>
            )}
          </div>
          <div
            className={`mt-0.5 text-[15px] font-semibold leading-snug ${
              completed
                ? "text-[#6B7280]"
                : isBlocked
                ? "text-[#9CA3AF]"
                : "text-[#111827]"
            }`}
          >
            {step.title}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="hidden shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:flex"
          style={{
            color: badgeStyle.color,
            backgroundColor: badgeStyle.bg,
            borderColor: badgeStyle.border,
          }}
        >
          {isBlocked && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          {badgeLabel}
        </div>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5">
              {/* Blocked callout */}
              {isBlocked && unmetDeps.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-r-lg border-l-[3px] border-l-[#DC2626] bg-[#FEF2F2] px-3.5 py-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="min-w-0">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#B91C1C]">
                      Complete all dependencies to unlock this step
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {unmetDeps.map((depId) => {
                        const dep = STEPS.find((s) => s.id === depId);
                        const depDone = completedIds.has(depId);
                        return (
                          <a
                            key={depId}
                            href={`#step-${depId}`}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[12px] transition-colors ${
                              depDone
                                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                                : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                            }`}
                          >
                            {depDone ? (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
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

              {/* Tool badge + cost pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  Tool
                </span>
                <span
                  className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                  style={{
                    color: toolStyle.color,
                    backgroundColor: toolStyle.bg,
                    borderColor: toolStyle.border,
                  }}
                >
                  {step.tool}
                </span>
                {step.monthly_cost > 0 && (
                  <span className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                    ${step.monthly_cost}/mo
                  </span>
                )}
                {step.one_time_cost > 0 && (
                  <span className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-xs font-semibold text-[#7C3AED]">
                    ${step.one_time_cost} one-time
                  </span>
                )}
              </div>

              {/* Instructions */}
              <StepBlocks blocks={step.blocks} />

              {/* Hairline divider */}
              <div className="h-px bg-[#E5E7EB]" />

              {/* Notes */}
              <StepNotes stepId={step.id} initialNotes={notes} />

              {/* Hairline divider */}
              <div className="h-px bg-[#E5E7EB]" />

              {/* Done when */}
              <div className="flex gap-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-4">
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#059669]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#059669]">
                    Done when
                  </div>
                  <div className="text-[14px] leading-[1.6] text-[#065F46]">
                    {step.done_when}
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
