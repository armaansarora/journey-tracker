"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, type StepRow } from "@/lib/supabase";
import { STEPS, PHASES, type Phase } from "@/lib/steps";
import { ProgressRing } from "@/components/ProgressRing";
import { WhatsNext } from "@/components/WhatsNext";
import { PhaseSection } from "@/components/PhaseSection";
import { PhaseDLocked } from "@/components/PhaseDLocked";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const seedRows = STEPS.map((s) => ({
        id: s.id,
        completed: false,
        completed_at: null,
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from("steps")
        .upsert(seedRows, { onConflict: "id", ignoreDuplicates: true });

      const { data, error } = await supabase
        .from("steps")
        .select("id, completed, completed_at, updated_at");

      if (!mounted) return;

      if (!error && data) {
        const done = new Set<string>(
          (data as StepRow[]).filter((r) => r.completed).map((r) => r.id)
        );
        setCompletedIds(done);
      }
      setLoaded(true);
    }

    init();

    const channel = supabase
      .channel("steps-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "steps" },
        (payload) => {
          const row = payload.new as StepRow | undefined;
          if (!row || !row.id) return;
          setCompletedIds((prev) => {
            const next = new Set(prev);
            if (row.completed) next.add(row.id);
            else next.delete(row.id);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const toggle = useCallback(async (id: string, nextCompleted: boolean) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (nextCompleted) next.add(id);
      else next.delete(id);
      return next;
    });

    const { error } = await supabase.from("steps").upsert(
      {
        id,
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (nextCompleted) next.delete(id);
        else next.add(id);
        return next;
      });
      console.error("toggle failed", error);
    }
  }, []);

  const total = STEPS.length;
  const completedCount = completedIds.size;

  const nextStep = useMemo(
    () => STEPS.find((s) => !completedIds.has(s.id)) ?? null,
    [completedIds]
  );

  const byPhase = useMemo(() => {
    const map: Record<Phase, typeof STEPS> = { A: [], B: [], C: [], D: [] };
    for (const s of STEPS) map[s.phase].push(s);
    return map;
  }, []);

  const phaseStartIndex: Record<Phase, number> = {
    A: 0,
    B: byPhase.A.length,
    C: byPhase.A.length + byPhase.B.length,
    D: byPhase.A.length + byPhase.B.length + byPhase.C.length,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 sm:mb-20"
      >
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-blue bg-blue-light border border-blue-border px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
            Implementation Roadmap
          </span>
        </div>
        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary">
          Journey Realty Group
        </h1>
        <div className="text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] font-medium leading-[1.15] tracking-[-0.015em] text-text-secondary mt-1">
          AI Automation Project
        </div>
        <p className="mt-5 text-[15px] sm:text-[17px] text-text-secondary leading-[1.6] max-w-2xl">
          Building an autonomous AI business operator for a NYC real estate company. 34 steps
          across 4 phases.
        </p>

        {/* Progress ring + phase summary */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 md:gap-10 items-center">
          <div className="flex justify-center md:justify-start">
            <ProgressRing completed={completedCount} total={total} size={200} />
          </div>
          <div className="space-y-4">
            {(["A", "B", "C", "D"] as Phase[]).map((p) => {
              const meta = PHASES[p];
              const phaseSteps = byPhase[p];
              const done = phaseSteps.filter((s) => completedIds.has(s.id)).length;
              const denom = phaseSteps.length || (p === "D" ? 1 : 1);
              const pct = phaseSteps.length > 0 ? (done / denom) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-[13px] sm:text-sm mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: meta.accent }}
                      >
                        {p}
                      </span>
                      <span className="font-semibold text-text-primary truncate">
                        {meta.short}
                      </span>
                    </div>
                    <span className="text-text-secondary tabular-nums shrink-0 font-medium">
                      {phaseSteps.length > 0 ? `${done} / ${phaseSteps.length}` : "Later"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.accent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's next */}
        <div className="mt-10">{loaded && <WhatsNext next={nextStep} />}</div>
      </motion.header>

      {/* Phase sections */}
      <div className="space-y-20 sm:space-y-24">
        <PhaseSection
          phase="A"
          steps={byPhase.A}
          completedIds={completedIds}
          currentStepId={nextStep?.id ?? null}
          onToggle={toggle}
          startIndex={phaseStartIndex.A}
        />
        <PhaseSection
          phase="B"
          steps={byPhase.B}
          completedIds={completedIds}
          currentStepId={nextStep?.id ?? null}
          onToggle={toggle}
          startIndex={phaseStartIndex.B}
        />
        <PhaseSection
          phase="C"
          steps={byPhase.C}
          completedIds={completedIds}
          currentStepId={nextStep?.id ?? null}
          onToggle={toggle}
          startIndex={phaseStartIndex.C}
        />
        <PhaseDLocked />
      </div>

      <Footer />
    </main>
  );
}
