"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Props = { completed: number; total: number; size?: number };

export default function ProgressRing({ completed, total, size = 200 }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const progress = useMotionValue(0);
  const strokeOffset = useTransform(
    progress,
    (v) => circumference - (circumference * v) / 100,
  );

  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(progress, pct, {
      duration: 1,
      ease: "easeOut",
    });

    const unsub = progress.on("change", (v) => {
      if (pctRef.current) pctRef.current.textContent = `${Math.round(v)}%`;
    });

    return () => {
      controls.stop();
      unsub();
    };
  }, [pct, progress]);

  const gradientId = "progress-gradient";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={8}
        />

        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: strokeOffset }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          ref={pctRef}
          className="font-semibold tracking-[-0.02em]"
          style={{ fontSize: 44, lineHeight: 1, color: "#0F172A" }}
        >
          0%
        </span>
        <span className="mt-1" style={{ fontSize: 13, color: "#475569" }}>
          {completed} of {total}
        </span>
      </div>
    </div>
  );
}
