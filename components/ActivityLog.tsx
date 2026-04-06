"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityLogRow } from "@/lib/supabase";
import { STEPS } from "@/lib/steps";
import { fmtDateTime } from "@/lib/utils";

type Props = {
  logs: ActivityLogRow[];
};

function stepTitle(stepId: string): string {
  const step = STEPS.find((s) => s.id === stepId);
  return step ? step.title : stepId;
}

function stepNumber(stepId: string): number {
  const idx = STEPS.findIndex((s) => s.id === stepId);
  return idx >= 0 ? idx + 1 : 0;
}

export function ActivityLog({ logs }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const visible = expanded ? sorted : sorted.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-hover/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset rounded-xl"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-semibold text-text-primary">Activity Log</span>
          {sorted.length > 0 && (
            <span className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full bg-[#F1F5F9] text-text-secondary">
              {sorted.length}
            </span>
          )}
        </div>
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
      </button>

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="px-5 pb-5">
          <p className="text-sm text-text-muted text-center py-4">
            No activity yet. Mark a step complete to start tracking.
          </p>
        </div>
      ) : (
        <div className="px-5 pb-4">
          <AnimatePresence initial={false} mode="sync">
            {visible.map((log) => (
              <motion.div
                key={log.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 py-2">
                  {/* Dot */}
                  <div
                    className="shrink-0 rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: log.action === "completed" ? "#059669" : "#DC2626",
                    }}
                  />
                  {/* Description */}
                  <span className="flex-1 min-w-0 text-[13px] text-text-secondary truncate">
                    Step {stepNumber(log.step_id)} {log.action}:{" "}
                    &ldquo;{stepTitle(log.step_id)}&rdquo;
                  </span>
                  {/* Timestamp */}
                  <span className="shrink-0 text-[13px] text-text-secondary tabular-nums">
                    {fmtDateTime(log.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show more / less toggle hint */}
          {sorted.length > 3 && !expanded && (
            <p className="text-[13px] text-text-muted text-center pt-1">
              +{sorted.length - 3} more
            </p>
          )}
        </div>
      )}
    </motion.section>
  );
}
