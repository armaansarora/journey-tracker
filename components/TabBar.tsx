"use client";

import { motion } from "framer-motion";

export type Tab = "roadmap" | "dashboard" | "activity";

const TABS: { id: Tab; label: string }[] = [
  { id: "roadmap", label: "Roadmap" },
  { id: "dashboard", label: "Dashboard" },
  { id: "activity", label: "Activity" },
];

type Props = { active: Tab; onChange: (tab: Tab) => void };

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border -mx-4 sm:-mx-6 px-4 sm:px-6">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 py-3 text-sm font-semibold text-center transition-colors cursor-pointer ${
              active === tab.id ? "text-blue" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
