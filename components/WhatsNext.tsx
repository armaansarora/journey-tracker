"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Step, PHASES } from "@/lib/steps";
import { fmtDuration } from "@/lib/utils";

type Props = {
  next: Step | null;
  prevCompletedAt: string | null; // completed_at of the step right before `next`
};

export function WhatsNext({ next, prevCompletedAt }: Props) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!prevCompletedAt) { setElapsed(""); return; }
    function tick() {
      const ms = Date.now() - new Date(prevCompletedAt!).getTime();
      setElapsed(fmtDuration(ms));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [prevCompletedAt]);

  if (!next) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-border bg-green-light p-5 flex items-center gap-4"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-white shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-green">All 34 steps complete</div>
          <div className="text-sm text-[#065F46]">The roadmap is done. Nice work.</div>
        </div>
      </motion.div>
    );
  }

  const phase = PHASES[next.phase];
  const preview = next.blocks
    .filter((b) => b.type === "step")
    .slice(0, 2)
    .map((b) => (b as { type: "step"; text: string }).text.replace(/\*\*/g, "").replace(/`/g, ""))
    .join(" ");

  return (
    <motion.a
      href={`#step-${next.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative block cursor-pointer rounded-xl border-2 border-blue-border bg-gradient-to-br from-blue-light to-bg p-5 shadow-[0_1px_2px_rgba(37,99,235,0.08)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)] hover:border-blue transition-all"
    >
      <div className="flex items-start justify-between mb-2.5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue">
            Up next
          </span>
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ color: phase.accent, backgroundColor: phase.light, border: `1px solid ${phase.border}` }}
        >
          {phase.short} · {next.week}
        </span>
      </div>
      <div className="text-[17px] sm:text-lg font-semibold text-text-primary mb-1 leading-snug">
        {next.title}
      </div>
      {elapsed && (
        <div className="text-[12px] text-text-muted font-medium mb-1.5">
          In progress for {elapsed}
        </div>
      )}
      <div className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
        {preview}
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue">
        Jump to step
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </motion.a>
  );
}
