"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  completed: number;
  total: number;
  size?: number;
};

export function ProgressRing({ completed, total, size = 200 }: Props) {
  const pct = total > 0 ? completed / total : 0;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const progressValue = useMotionValue(0);
  const dashOffset = useTransform(progressValue, (v) => circ - v * circ);
  const [displayPct, setDisplayPct] = useState(0);
  const [displayDone, setDisplayDone] = useState(0);

  useEffect(() => {
    const controls = animate(progressValue, pct, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = progressValue.on("change", (v) => {
      setDisplayPct(Math.round(v * 100));
      setDisplayDone(Math.round(v * total));
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [pct, progressValue, total]);

  const gradientId = "ring-gradient";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#0EA5A4" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] font-semibold text-[#111827] tabular-nums leading-none tracking-tight">
          {displayPct}
          <span className="text-2xl text-[#9CA3AF]">%</span>
        </span>
        <span className="text-[13px] text-[#6B7280] mt-2 font-medium tabular-nums">
          {displayDone} of {total} complete
        </span>
      </div>
    </div>
  );
}
