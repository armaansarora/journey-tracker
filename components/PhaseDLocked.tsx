"use client";

import { motion } from "framer-motion";

export function PhaseDLocked() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 opacity-70">
          <span className="relative inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl text-xl sm:text-2xl font-bold text-white bg-text-muted shrink-0">
            D
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-border flex items-center justify-center text-text-secondary">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-secondary leading-tight tracking-tight">
              Phase D — WhatsApp
            </h2>
            <div className="text-xs sm:text-sm text-text-muted mt-0.5 font-medium">
              Later · Locked until trust is earned
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(107,114,128,0.03)_10px,rgba(107,114,128,0.03)_20px)] pointer-events-none" />
        <div className="relative">
          <p className="text-[14px] sm:text-[15px] leading-[1.7] text-text-secondary">
            This phase begins after Selim and Najat have used the agent system for several weeks
            and trust it. It automates tenant communication via WhatsApp — the highest-stakes
            part of the business.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
