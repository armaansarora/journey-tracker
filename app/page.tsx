"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, type StepRow, type ActivityLogRow } from "@/lib/supabase";
import { STEPS, PHASES, type Phase } from "@/lib/steps";
import { ProgressRing } from "@/components/ProgressRing";
import { WhatsNext } from "@/components/WhatsNext";
import { PhaseSection } from "@/components/PhaseSection";
import { PhaseDLocked } from "@/components/PhaseDLocked";
import { CostDashboard } from "@/components/CostDashboard";
import { VelocityTracker } from "@/components/VelocityTracker";
import { PlannedVsActual } from "@/components/PlannedVsActual";
import { CostProjections } from "@/components/CostProjections";
import { ActivityLog } from "@/components/ActivityLog";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Footer } from "@/components/Footer";

type RowData = { completed_at: string | null; notes: string };

export default function HomePage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [stepRows, setStepRows] = useState<Map<string, RowData>>(new Map());
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ---- Init: seed, fetch, subscribe ----
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Seed
      const seedRows = STEPS.map((s) => ({
        id: s.id, completed: false, completed_at: null, updated_at: new Date().toISOString(), notes: "",
      }));
      await supabase.from("steps").upsert(seedRows, { onConflict: "id", ignoreDuplicates: true });

      // Fetch steps
      const { data } = await supabase.from("steps").select("id, completed, completed_at, updated_at, notes");
      if (!mounted) return;
      if (data) {
        const done = new Set<string>();
        const rows = new Map<string, RowData>();
        for (const r of data as StepRow[]) {
          if (r.completed) done.add(r.id);
          rows.set(r.id, { completed_at: r.completed_at, notes: r.notes ?? "" });
        }
        setCompletedIds(done);
        setStepRows(rows);
      }

      // Fetch activity logs
      const { data: logData } = await supabase
        .from("activity_log")
        .select("id, step_id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!mounted) return;
      if (logData) setActivityLogs(logData as ActivityLogRow[]);

      setLoaded(true);
    }
    init();

    // Realtime — steps
    const stepChannel = supabase
      .channel("steps-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "steps" }, (payload) => {
        const row = payload.new as StepRow | undefined;
        if (!row?.id) return;
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (row.completed) next.add(row.id); else next.delete(row.id);
          return next;
        });
        setStepRows((prev) => {
          const next = new Map(prev);
          next.set(row.id, { completed_at: row.completed_at, notes: row.notes ?? "" });
          return next;
        });
      })
      .subscribe();

    // Realtime — activity_log
    const logChannel = supabase
      .channel("activity-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        const row = payload.new as ActivityLogRow | undefined;
        if (!row) return;
        setActivityLogs((prev) => [row, ...prev]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(stepChannel);
      supabase.removeChannel(logChannel);
    };
  }, []);

  // ---- Toggle step ----
  const toggle = useCallback(async (id: string, nextCompleted: boolean) => {
    const now = new Date().toISOString();

    // Optimistic
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (nextCompleted) next.add(id); else next.delete(id);
      return next;
    });
    setStepRows((prev) => {
      const next = new Map(prev);
      const old = next.get(id);
      next.set(id, { ...(old ?? { notes: "" }), completed_at: nextCompleted ? now : null });
      return next;
    });

    // Persist step
    const { error } = await supabase.from("steps").upsert({
      id, completed: nextCompleted,
      completed_at: nextCompleted ? now : null,
      updated_at: now,
    }, { onConflict: "id" });

    if (error) {
      // Rollback
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (nextCompleted) next.delete(id); else next.add(id);
        return next;
      });
      console.error("toggle failed", error);
      return;
    }

    // Activity log insert (fire-and-forget)
    supabase.from("activity_log").insert({
      step_id: id,
      action: nextCompleted ? "completed" : "uncompleted",
    }).then();
  }, []);

  // ---- Derived state ----
  const byPhase = useMemo(() => {
    const map: Record<Phase, typeof STEPS> = { A: [], B: [], C: [], D: [] };
    for (const s of STEPS) map[s.phase].push(s);
    return map;
  }, []);

  // Dependency awareness
  const { blockedIds, availableIds } = useMemo(() => {
    const blocked = new Set<string>();
    const available = new Set<string>();
    for (const s of STEPS) {
      if (completedIds.has(s.id)) continue;
      const unmet = s.dependencies.filter((d) => !completedIds.has(d));
      if (unmet.length > 0) blocked.add(s.id);
      else available.add(s.id);
    }
    return { blockedIds: blocked, availableIds: available };
  }, [completedIds]);

  // Next step = first available (not blocked) step
  const nextStep = useMemo(
    () => STEPS.find((s) => availableIds.has(s.id)) ?? null,
    [availableIds]
  );

  // Previous step's completed_at (for time-in-step)
  const prevCompletedAt = useMemo(() => {
    if (!nextStep) return null;
    const idx = STEPS.findIndex((s) => s.id === nextStep.id);
    // Find the most recent completed_at before this step
    const completedDates = STEPS
      .filter((s) => completedIds.has(s.id))
      .map((s) => stepRows.get(s.id)?.completed_at)
      .filter(Boolean)
      .sort();
    return completedDates.length > 0 ? completedDates[completedDates.length - 1]! : null;
  }, [nextStep, completedIds, stepRows]);

  // First completion date
  const projectStartDate = useMemo(() => {
    const dates = [...stepRows.values()]
      .map((r) => r.completed_at)
      .filter(Boolean)
      .sort();
    return dates.length > 0 ? dates[0]! : null;
  }, [stepRows]);

  // Monthly burn for cost dashboard
  const monthlyBurn = useMemo(
    () => STEPS.filter((s) => completedIds.has(s.id)).reduce((sum, s) => sum + s.monthly_cost, 0),
    [completedIds]
  );

  const total = STEPS.length;
  const completedCount = completedIds.size;

  const phaseStartIndex: Record<Phase, number> = {
    A: 0, B: byPhase.A.length, C: byPhase.A.length + byPhase.B.length,
    D: byPhase.A.length + byPhase.B.length + byPhase.C.length,
  };

  if (!loaded) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
        <LoadingSkeleton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
      {/* 1. Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 sm:mb-14"
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
          Building an autonomous AI business operator for a NYC real estate company. 34 steps across 4 phases.
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
              const pct = phaseSteps.length > 0 ? (done / phaseSteps.length) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-[13px] sm:text-sm mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: meta.accent }}>
                        {p}
                      </span>
                      <span className="font-semibold text-text-primary truncate">{meta.short}</span>
                    </div>
                    <span className="text-text-secondary tabular-nums shrink-0 font-medium">
                      {phaseSteps.length > 0 ? `${done} / ${phaseSteps.length}` : "Later"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full" style={{ backgroundColor: meta.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* 2. What's Next */}
      <div className="mb-12">
        <WhatsNext next={nextStep} prevCompletedAt={prevCompletedAt} />
      </div>

      {/* 3. Cost Dashboard */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Dashboard</h2>
        <CostDashboard completedIds={completedIds} stepRows={stepRows} />
      </div>

      {/* 4. Velocity Tracker */}
      <div className="mb-12">
        <VelocityTracker completedIds={completedIds} stepRows={stepRows} />
      </div>

      {/* 5. Planned vs Actual */}
      <div className="mb-16">
        <PlannedVsActual completedIds={completedIds} stepRows={stepRows} projectStartDate={projectStartDate} />
      </div>

      {/* 6-9. Phase sections */}
      <div className="space-y-20 sm:space-y-24">
        {(["A", "B", "C"] as Phase[]).map((p) => (
          <PhaseSection
            key={p}
            phase={p}
            steps={byPhase[p]}
            completedIds={completedIds}
            currentStepId={nextStep?.id ?? null}
            blockedIds={blockedIds}
            availableIds={availableIds}
            stepRows={stepRows}
            onToggle={toggle}
            startIndex={phaseStartIndex[p]}
          />
        ))}
        <PhaseDLocked />
      </div>

      {/* 10. Cost Projections */}
      <div className="mt-16">
        <CostProjections currentMonthlyBurn={monthlyBurn} />
      </div>

      {/* 11. Activity Log */}
      <div className="mt-12">
        <ActivityLog logs={activityLogs} />
      </div>

      <Footer />
    </main>
  );
}
