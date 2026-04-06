"use client";

import { motion } from "framer-motion";

export type Tab = "roadmap" | "dashboard" | "activity";

type Props = { active: Tab; onChange: (tab: Tab) => void };

const TABS: { key: Tab; label: string }[] = [
  { key: "roadmap", label: "Roadmap" },
  { key: "dashboard", label: "Dashboard" },
  { key: "activity", label: "Activity" },
];

export default function TabBar({ active, onChange }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-4xl">
        {TABS.map(({ key, label }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative flex-1 py-3 text-sm font-medium cursor-pointer transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-t-muted hover:text-t-secondary"
              }`}
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
