"use client";

import { type ReactNode, useState, useCallback } from "react";
import type { Block } from "@/lib/steps";

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
      onClick={copy}
      className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-[11px] font-medium px-2 py-1 rounded-md bg-bg border border-border text-text-muted hover:text-text-primary cursor-pointer"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// Parse inline `code` and **bold** into ReactNodes
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
          className="font-mono text-[0.86em] bg-surface-hover text-text-primary px-[6px] py-[2px] rounded-[4px] border border-border whitespace-nowrap"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong key={i++} className="font-semibold text-text-primary">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    last = match.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function CalloutIcon({ variant }: { variant: "tip" | "warning" | "important" }) {
  if (variant === "tip") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const CALLOUT_STYLES: Record<"tip" | "warning" | "important", { bg: string; border: string; label: string; labelColor: string }> = {
  tip: { bg: "#EFF6FF", border: "#2563EB", label: "Tip", labelColor: "#1D4ED8" },
  warning: { bg: "#FFFBEB", border: "#D97706", label: "Warning", labelColor: "#B45309" },
  important: { bg: "#FEF2F2", border: "#DC2626", label: "Important", labelColor: "#B91C1C" },
};

export function StepBlocks({ blocks }: { blocks: Block[] }) {
  // Assign sequential numbers to "step" blocks only
  let stepNum = 0;
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === "step") {
          stepNum += 1;
          return (
            <div key={idx} className="flex gap-3 items-start">
              <span className="shrink-0 inline-flex items-center justify-center h-[22px] w-[22px] rounded-full bg-surface-hover text-[11px] font-semibold tabular-nums text-text-secondary border border-border mt-[1px]">
                {stepNum}
              </span>
              <div className="text-[14px] sm:text-[14.5px] text-text-secondary leading-[1.65] min-w-0 flex-1">
                {renderInline(block.text)}
              </div>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <div key={idx} className="relative group/code ml-[34px]">
              <pre className="font-mono text-[12.5px] leading-[1.6] text-text-primary bg-surface-hover px-4 py-3 rounded-lg border-l-[3px] border-l-blue border-y border-r border-y-border border-r-border overflow-x-auto whitespace-pre">
                {block.text}
              </pre>
              <CopyButton text={block.text} />
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <div key={idx} className="ml-[34px]">
              {block.label && (
                <div className="text-[13px] font-semibold text-text-primary mb-2">
                  {renderInline(block.label)}
                </div>
              )}
              <ul className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] text-text-secondary leading-[1.6]">
                    <span className="shrink-0 mt-[9px] h-1 w-1 rounded-full bg-text-muted" aria-hidden />
                    <span className="min-w-0 flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Callouts
        const variant = block.type as "tip" | "warning" | "important";
        const style = CALLOUT_STYLES[variant];
        return (
          <div
            key={idx}
            className="ml-[34px] flex gap-2.5 items-start px-3.5 py-3 rounded-r-lg border-l-[3px]"
            style={{ backgroundColor: style.bg, borderLeftColor: style.border }}
          >
            <span className="shrink-0 mt-[2px]">
              <CalloutIcon variant={variant} />
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.08em] mb-0.5"
                style={{ color: style.labelColor }}
              >
                {style.label}
              </div>
              <div className="text-[13.5px] text-text-primary leading-[1.6]">
                {renderInline(block.text)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
