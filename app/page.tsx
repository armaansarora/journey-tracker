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

  // Seed + fetch initial state
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Seed rows that don't exist yet (upsert with ignoreDuplicates)
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

    // Realtime subscription
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

  const toggle = useCallback(
    async (id: string, nextCompleted: boolean) => {
      // Optimistic update
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
        // Rollback
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (nextCompleted) next.delete(id);
          else next.add(id);
          return next;
        });
        console.error("toggle failed", error);
      }
    },
    []
  );

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 sm:mb-14"
      >
        <div className="mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue bg-blue-light border border-blue-border px-2.5 py-1 rounded-full">
            Implementation Roadmap
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold leading-[1.15] tracking-tight text-text-primary">
          Journey Realty Group
          <span className="block text-text-secondary font-medium mt-1 text-2xl sm:text-3xl md:text-4xl">
            AI Automation Project
          </span>
        </h1>
        <p className="mt-4 text-[15px] sm:text-base text-text-secondary leading-relaxed max-w-2xl">
          Building an autonomous AI business operator for a NYC real estate company.
          34 steps across 4 phases.
        </p>

        {/* Progress ring + phase summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <ProgressRing completed={completedCount} total={total} size={180} />
          </div>
          <div className="space-y-3">
            {(["A", "B", "C", "D"] as Phase[]).map((p) => {
              const meta = PHASES[p];
              const phaseSteps = byPhase[p];
              const done = phaseSteps.filter((s) => completedIds.has(s.id)).length;
              const pct = phaseSteps.length > 0 ? (done / phaseSteps.length) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-medium text-text-primary truncate pr-2">
                      {meta.title}
                    </span>
                    <span className="text-text-secondary tabular-nums shrink-0">
                      {done} of {phaseSteps.length || "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="mt-8">
          {loaded && <WhatsNext next={nextStep} />}
        </div>
      </motion.header>

      {/* Phase sections */}
      <div className="space-y-8 sm:space-y-10">
        <PhaseSection phase="A" steps={byPhase.A} completedIds={completedIds} onToggle={toggle} />
        <PhaseSection phase="B" steps={byPhase.B} completedIds={completedIds} onToggle={toggle} />
        <PhaseSection phase="C" steps={byPhase.C} completedIds={completedIds} onToggle={toggle} />
        <PhaseDLocked />
      </div>

      <Footer />
    </main>
  );
}
