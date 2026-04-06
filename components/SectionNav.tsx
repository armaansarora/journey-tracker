"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PHASES, type Phase } from "@/lib/steps";

const PHASE_IDS: Phase[] = ["A", "B", "C", "D"];

export function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Phase>("A");

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);

      // Determine current phase based on scroll position
      for (const p of [...PHASE_IDS].reverse()) {
        const el = document.getElementById(`phase-${p}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.4) {
            setCurrent(p);
            break;
          }
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (p: Phase) => {
    document.getElementById(`phase-${p}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-4 sm:bottom-auto sm:top-20 sm:right-6 z-50 flex flex-col items-end gap-2"
        >
          {/* Phase pills */}
          <div className="flex gap-1 rounded-full bg-bg/95 backdrop-blur-sm border border-border shadow-lg px-1.5 py-1.5">
            {PHASE_IDS.map((p) => {
              const meta = PHASES[p];
              const isCurrent = current === p;
              return (
                <button
                  key={p}
                  onClick={() => scrollTo(p)}
                  className="relative h-8 w-8 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: isCurrent ? meta.accent : "transparent",
                    color: isCurrent ? "#fff" : "#9CA3AF",
                  }}
                  aria-label={`Scroll to Phase ${p}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-blue text-white shadow-lg flex items-center justify-center hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
