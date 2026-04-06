"use client";

import { useEffect, useState } from "react";
import { type Step, PHASES } from "@/lib/steps";
import { fmtDuration } from "@/lib/utils";

type Props = {
  next: Step | null;
  prevCompletedAt: string | null;
};

export default function WhatsNext({ next, prevCompletedAt }: Props) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!prevCompletedAt) {
      setElapsed("");
      return;
    }

    function tick() {
      const ms = Date.now() - new Date(prevCompletedAt!).getTime();
      setElapsed(fmtDuration(ms));
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [prevCompletedAt]);

  /* ---- All-done state ---- */
  if (!next) {
    return (
      <div className="rounded-card border border-success-border bg-success-light p-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-success">
            All steps complete
          </p>
          <p className="text-xs text-t-secondary mt-0.5">
            Every phase has been finished. Nice work.
          </p>
        </div>
      </div>
    );
  }

  const phase = PHASES[next.phase];

  /* Preview text from first 2 blocks */
  const preview = next.blocks
    .slice(0, 2)
    .map((b) => {
      if ("text" in b) return b.text.replace(/\*\*/g, "");
      if ("items" in b) return b.items.join(", ");
      return "";
    })
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white border-2 border-primary-light rounded-card p-5 hover:border-primary transition-colors duration-200">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span
          className="font-medium uppercase tracking-[0.06em] text-primary"
          style={{ fontSize: 11 }}
        >
          Up next
        </span>
      </div>

      {/* Phase + week badge */}
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2"
        style={{
          backgroundColor: `${phase.accent}26`,
          color: phase.accent,
        }}
      >
        {next.phase} &middot; {next.week}
      </span>

      {/* Title */}
      <h3
        className="font-semibold text-t-primary mb-1"
        style={{ fontSize: 17 }}
      >
        {next.title}
      </h3>

      {/* Time in step */}
      {prevCompletedAt && elapsed && (
        <p className="text-t-muted mb-2" style={{ fontSize: 12 }}>
          In this step for {elapsed}
        </p>
      )}

      {/* Preview */}
      {preview && (
        <p
          className="text-t-secondary line-clamp-2 mb-3"
          style={{ fontSize: 14 }}
        >
          {preview}
        </p>
      )}

      {/* Jump link */}
      <a
        href={`#step-${next.id}`}
        className="text-primary font-semibold inline-flex items-center gap-1 hover:underline"
        style={{ fontSize: 13 }}
      >
        Jump to step
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}
