"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  completed: number;
  total: number;
  size?: number;
};

export function ProgressRing({ completed, total, size = 180 }: Props) {
  const pct = total > 0 ? completed / total : 0;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  // color transition: blue (low) → green (high)
  const color = pct < 0.33 ? "#2563EB" : pct < 0.75 ? "#0EA5A4" : "#059669";

  const progressValue = useMotionValue(0);
  const dashOffset = useTransform(progressValue, (v) => circ - v * circ);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const controls = animate(progressValue, pct, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = progressValue.on("change", (v) => {
      setDisplayPct(Math.round(v * 100));
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [pct, progressValue]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums text-text-primary">
          {displayPct}%
        </span>
        <span className="text-xs text-text-secondary mt-1 font-medium">
          {completed} of {total}
        </span>
      </div>
    </div>
  );
}
