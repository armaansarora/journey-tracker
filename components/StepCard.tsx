"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Step, PHASES } from "@/lib/steps";

type Props = {
  step: Step;
  index: number;
  completed: boolean;
  onToggle: (id: string, next: boolean) => void;
};

export function StepCard({ step, index, completed, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASES[step.phase];

  const status = completed ? "Done" : expanded ? "In Progress" : "Pending";
  const statusColors = completed
    ? { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" }
    : expanded
    ? { color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE" }
    : { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };

  return (
    <motion.div
      layout
      id={`step-${step.id}`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
        completed ? "border-green-border" : "border-border hover:border-text-muted"
      }`}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: completed ? "#059669" : phase.accent,
      }}
    >
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
        className="w-full cursor-pointer text-left px-4 py-4 sm:px-5 flex items-center gap-3 sm:gap-4 hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        {/* Completion circle */}
        <div
          role="checkbox"
          aria-checked={completed}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle(step.id, !completed);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggle(step.id, !completed);
            }
          }}
          className="cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 rounded-full"
        >
          <motion.div
            animate={
              completed
                ? { scale: [1, 1.15, 1], backgroundColor: "#059669", borderColor: "#059669" }
                : { scale: 1, backgroundColor: "#FFFFFF", borderColor: "#D1D5DB" }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="h-9 w-9 rounded-full border-2 flex items-center justify-center"
          >
            <AnimatePresence>
              {completed && (
                <motion.svg
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
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
              )}
            </AnimatePresence>
            {!completed && (
              <span className="text-xs font-semibold text-text-muted tabular-nums">
                {index + 1}
              </span>
            )}
          </motion.div>
        </div>

        {/* Title + week */}
        <div className="min-w-0 flex-1">
          <div className="text-[13px] sm:text-sm text-text-muted font-medium">{step.week}</div>
          <div className={`text-sm sm:text-base font-semibold leading-snug ${completed ? "text-text-secondary" : "text-text-primary"}`}>
            {step.title}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border hidden sm:inline-block"
          style={{
            color: statusColors.color,
            backgroundColor: statusColors.bg,
            borderColor: statusColors.border,
          }}
        >
          {status}
        </div>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          width="18"
          height="18"
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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tool
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{
                    color: phase.accent,
                    backgroundColor: phase.light,
                    borderColor: phase.border,
                  }}
                >
                  {step.tool}
                </span>
              </div>

              <div className="text-sm text-text-secondary leading-relaxed">
                {step.details}
              </div>

              <div
                className="rounded-lg border p-3 text-sm"
                style={{
                  backgroundColor: completed ? "#ECFDF5" : "#F9FAFB",
                  borderColor: completed ? "#A7F3D0" : "#E5E7EB",
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: completed ? "#059669" : "#6B7280" }}>
                  Done when
                </div>
                <div className={completed ? "text-green" : "text-text-primary"}>
                  {step.done_when}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
