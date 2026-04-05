"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Step, PHASES, toolCategory, TOOL_STYLES } from "@/lib/steps";

type Props = {
  step: Step;
  index: number;
  completed: boolean;
  isCurrent: boolean;
  onToggle: (id: string, next: boolean) => void;
};

export function StepCard({ step, index, completed, isCurrent, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASES[step.phase];
  const toolStyle = TOOL_STYLES[toolCategory(step.tool)];

  const leftBorderColor = completed ? "#059669" : phase.accent;

  return (
    <motion.div
      layout
      id={`step-${step.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.025, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow,background-color] duration-200 ${
        completed
          ? "border-green-border shadow-[0_1px_2px_rgba(5,150,105,0.06)]"
          : "border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] hover:border-[#CBD5E1] hover:shadow-[0_4px_12px_rgba(17,24,39,0.06)]"
      }`}
      style={{
        backgroundColor: completed ? "#F6FDF9" : "#FFFFFF",
      }}
    >
      {/* Left border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: leftBorderColor }}
      />
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className="w-full cursor-pointer text-left pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 flex items-center gap-3 sm:gap-4 hover:bg-surface-hover/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset"
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
                ? { scale: [1, 1.2, 1], backgroundColor: "#059669", borderColor: "#059669" }
                : isCurrent
                ? { scale: 1, backgroundColor: "#FFFFFF", borderColor: phase.accent }
                : { scale: 1, backgroundColor: "#FFFFFF", borderColor: "#D1D5DB" }
            }
            transition={{ duration: 0.4, ease: [0.22, 1.2, 0.36, 1] }}
            className="h-10 w-10 rounded-full border-2 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.svg
                  key="check"
                  initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1.2, 0.36, 1] }}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
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

        {/* Title + week */}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] sm:text-xs text-text-muted font-semibold uppercase tracking-wider">
            {step.week}
          </div>
          <div className={`mt-0.5 text-[15px] sm:text-base font-semibold leading-snug ${completed ? "text-text-secondary" : "text-text-primary"}`}>
            {step.title}
          </div>
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
            <div className="pl-5 pr-4 pb-5 sm:pl-6 sm:pr-5 space-y-4">
              {/* Tool badge */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Tool
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-md border"
                  style={{
                    color: toolStyle.color,
                    backgroundColor: toolStyle.bg,
                    borderColor: toolStyle.border,
                  }}
                >
                  {step.tool}
                </span>
              </div>

              {/* Instructions */}
              <div className="text-[14px] sm:text-[15px] text-text-secondary leading-[1.7] whitespace-pre-line">
                {step.details}
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Done when */}
              <div
                className="rounded-lg border p-4 flex gap-3"
                style={{
                  backgroundColor: "#ECFDF5",
                  borderColor: "#A7F3D0",
                }}
              >
                <div className="shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded-full bg-green flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-green mb-1">
                    Done when
                  </div>
                  <div className="text-[14px] text-[#065F46] leading-[1.6]">
                    {step.done_when}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
