"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHASES, type Phase } from "@/lib/steps";

const PHASE_KEYS: Phase[] = ["A", "B", "C", "D"];

export default function SectionNav({ currentPhase }: { currentPhase?: Phase }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (phase: Phase) => {
    const el = document.getElementById(`phase-${phase}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 md:fixed md:top-6 md:right-6 md:bottom-auto"
        >
          <div className="flex items-center gap-1 rounded-full bg-white border border-border px-2 py-1.5">
            {PHASE_KEYS.map((p) => {
              const isCurrent = p === currentPhase;
              return (
                <button
                  key={p}
                  onClick={() => scrollTo(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-white"
                      : "text-t-muted hover:text-t-secondary"
                  }`}
                  title={PHASES[p].title}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={scrollToTop}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white cursor-pointer transition-colors duration-200 hover:bg-primary-dark"
            title="Back to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
