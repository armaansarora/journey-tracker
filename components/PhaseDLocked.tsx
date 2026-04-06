"use client";

export function PhaseDLocked() {
  return (
    <section id="phase-D" className="scroll-mt-16">
      {/* Phase header - desaturated */}
      <div className="mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          {/* Badge with lock overlay */}
          <span className="relative inline-flex items-center justify-center h-12 w-12 rounded-card text-xl font-bold text-white bg-[#94A3B8] flex-shrink-0">
            D
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-white border border-border text-t-muted">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-semibold text-t-secondary leading-tight">
              Phase D — WhatsApp
            </h2>
            <p className="text-[13px] text-t-muted mt-0.5 font-medium">
              Later &middot; Locked until trust is earned
            </p>
          </div>
        </div>
      </div>

      {/* Content card with diagonal stripe pattern */}
      <div className="relative overflow-hidden rounded-card border border-border bg-white p-card">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(148,163,184,0.06) 10px, rgba(148,163,184,0.06) 20px)",
          }}
        />
        <div className="relative">
          <p className="text-[14px] sm:text-[15px] leading-[1.7] text-t-secondary">
            This phase begins after Selim and Najat have used the agent system for several weeks
            and trust it. It automates tenant communication via WhatsApp — the highest-stakes
            part of the business.
          </p>
        </div>
      </div>
    </section>
  );
}
