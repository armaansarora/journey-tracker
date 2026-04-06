"use client";

import { type ReactNode, useState, useCallback } from "react";
import type { Block } from "@/lib/steps";

/* ------------------------------------------------------------------ */
/*  Copy button for code blocks                                       */
/* ------------------------------------------------------------------ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-[11px] font-medium px-2 py-1 rounded-sm border border-border bg-white text-t-muted hover:text-t-primary cursor-pointer"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline parser: `code` and **bold**                                */
/* ------------------------------------------------------------------ */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const tok = match[0];
    if (tok.startsWith("`")) {
      parts.push(
        <code
          key={i++}
          className="font-mono text-[0.86em] bg-surface border border-border rounded px-1.5 py-0.5 whitespace-nowrap"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong key={i++} className="font-semibold text-t-primary">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    last = match.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ */
/*  Callout SVG icons                                                 */
/* ------------------------------------------------------------------ */
function CalloutIcon({ variant }: { variant: "tip" | "warning" | "important" }) {
  if (variant === "tip") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  // important
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Callout styles                                                    */
/* ------------------------------------------------------------------ */
const CALLOUT_STYLES: Record<
  "tip" | "warning" | "important",
  { bg: string; borderL: string; label: string; labelColor: string }
> = {
  tip:       { bg: "#F0F9FF", borderL: "#0369A1", label: "Tip",       labelColor: "#0369A1" },
  warning:   { bg: "#FFFBEB", borderL: "#D97706", label: "Warning",   labelColor: "#D97706" },
  important: { bg: "#FEF2F2", borderL: "#DC2626", label: "Important", labelColor: "#DC2626" },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export function StepBlocks({ blocks }: { blocks: Block[] }) {
  let stepNum = 0;

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        /* step blocks */
        if (block.type === "step") {
          stepNum += 1;
          return (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-surface border border-border text-[11px] font-medium tabular-nums text-t-secondary mt-[2px]">
                {stepNum}
              </span>
              <p className="text-[14px] text-t-secondary leading-[1.65] min-w-0 flex-1">
                {renderInline(block.text)}
              </p>
            </div>
          );
        }

        /* code blocks */
        if (block.type === "code") {
          return (
            <div key={idx} className="relative group/code ml-[34px]">
              <pre className="font-mono text-[12.5px] leading-[1.6] bg-surface px-4 py-3 rounded-sm border-l-[3px] border-l-accent border-y border-r border-y-border border-r-border overflow-x-auto whitespace-pre text-t-primary">
                {block.text}
              </pre>
              <CopyButton text={block.text} />
            </div>
          );
        }

        /* list blocks */
        if (block.type === "list") {
          return (
            <div key={idx} className="ml-[34px]">
              {block.label && (
                <p className="text-[13px] font-semibold text-t-primary mb-2">
                  {renderInline(block.label)}
                </p>
              )}
              <ul className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-t-secondary leading-[1.6]">
                    <span className="flex-shrink-0 mt-[9px] h-1 w-1 rounded-full bg-t-muted" aria-hidden />
                    <span className="min-w-0 flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        /* callout blocks (tip / warning / important) */
        const variant = block.type as "tip" | "warning" | "important";
        const style = CALLOUT_STYLES[variant];
        return (
          <div
            key={idx}
            className="ml-[34px] flex items-start gap-2.5 px-3.5 py-3 rounded-r-sm border-l-[3px]"
            style={{ backgroundColor: style.bg, borderLeftColor: style.borderL }}
          >
            <span className="flex-shrink-0 mt-[2px]">
              <CalloutIcon variant={variant} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.06em] mb-0.5"
                style={{ color: style.labelColor }}
              >
                {style.label}
              </p>
              <p className="text-[13.5px] text-t-secondary leading-[1.6]">
                {renderInline(block.text)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
