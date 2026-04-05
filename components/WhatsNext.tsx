"use client";

import { motion } from "framer-motion";
import { Step, PHASES } from "@/lib/steps";

type Props = {
  next: Step | null;
};

export function WhatsNext({ next }: Props) {
  if (!next) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-border bg-green-light p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-green">All steps complete</div>
            <div className="text-sm text-text-secondary">The roadmap is done. Nice work.</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const phase = PHASES[next.phase];

  return (
    <motion.a
      href={`#step-${next.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="block cursor-pointer rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-border transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          What&rsquo;s next
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ color: phase.accent, backgroundColor: phase.light }}
        >
          {phase.title.replace(/^Phase /, "")} · {next.week}
        </span>
      </div>
      <div className="text-base font-semibold text-text-primary mb-1 leading-snug">
        {next.title}
      </div>
      <div className="text-sm text-text-secondary line-clamp-2">{next.details}</div>
    </motion.a>
  );
}
