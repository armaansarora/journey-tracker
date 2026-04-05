"use client";

import { motion } from "framer-motion";

export function PhaseDLocked() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-bold text-white bg-text-secondary">
          D
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-tight">
            Phase D: WhatsApp
          </h2>
          <div className="text-xs sm:text-sm text-text-secondary">Later · Locked</div>
        </div>
        <div className="shrink-0 text-text-muted">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-border p-5">
        <p className="text-sm sm:text-[15px] leading-relaxed text-text-secondary">
          This phase begins after Selim and Najat have used the agent system for several weeks and trust it. It automates tenant communication via WhatsApp — the highest-stakes part of the business.
        </p>
      </div>
    </motion.section>
  );
}
