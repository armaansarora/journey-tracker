"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type StepRow, type ActivityLogRow } from "@/lib/supabase";
import { STEPS, PHASES, type Phase } from "@/lib/steps";
import ProgressRing from "@/components/ProgressRing";
import WhatsNext from "@/components/WhatsNext";
import { PhaseSection } from "@/components/PhaseSection";
import { PhaseDLocked } from "@/components/PhaseDLocked";
import { CostDashboard } from "@/components/CostDashboard";
import { VelocityTracker } from "@/components/VelocityTracker";
import { CostProjections } from "@/components/CostProjections";
import { ActivityLog } from "@/components/ActivityLog";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TabBar, { type Tab } from "@/components/TabBar";
import SectionNav from "@/components/SectionNav";
import Footer from "@/components/Footer";

type RowData = { completed_at: string | null; notes: string };

export default function HomePage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [stepRows, setStepRows] = useState<Map<string, RowData>>(new Map());
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("roadmap");

  /* ── Init ── */
  useEffect(() => {
    let mounted = true;
    async function init() {
      const seedRows = STEPS.map((s) => ({
        id: s.id, completed: false, completed_at: null,
        updated_at: new Date().toISOString(), notes: "",
      }));
      await supabase.from("steps").upsert(seedRows, { onConflict: "id", ignoreDuplicates: true });

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

      const { data: logData } = await supabase
        .from("activity_log").select("id, step_id, action, created_at")
        .order("created_at", { ascending: false }).limit(200);
      if (!mounted) return;
      if (logData) setActivityLogs(logData as ActivityLogRow[]);
      setLoaded(true);
    }
    init();

    const stepCh = supabase.channel("steps-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "steps" }, (payload) => {
        const row = payload.new as StepRow | undefined;
        if (!row?.id) return;
        setCompletedIds((p) => { const n = new Set(p); row.completed ? n.add(row.id) : n.delete(row.id); return n; });
        setStepRows((p) => { const n = new Map(p); n.set(row.id, { completed_at: row.completed_at, notes: row.notes ?? "" }); return n; });
      }).subscribe();

    const logCh = supabase.channel("activity-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        const row = payload.new as ActivityLogRow | undefined;
        if (row) setActivityLogs((p) => [row, ...p]);
      }).subscribe();

    return () => { mounted = false; supabase.removeChannel(stepCh); supabase.removeChannel(logCh); };
  }, []);

  /* ── Toggle ── */
  const toggle = useCallback(async (id: string, next: boolean) => {
    const now = new Date().toISOString();
    setCompletedIds((p) => { const n = new Set(p); next ? n.add(id) : n.delete(id); return n; });
    setStepRows((p) => { const n = new Map(p); const old = n.get(id); n.set(id, { ...(old ?? { notes: "" }), completed_at: next ? now : null }); return n; });

    const { error } = await supabase.from("steps").upsert(
      { id, completed: next, completed_at: next ? now : null, updated_at: now },
      { onConflict: "id" },
    );
    if (error) {
      setCompletedIds((p) => { const n = new Set(p); next ? n.delete(id) : n.add(id); return n; });
      return;
    }
    supabase.from("activity_log").insert({ step_id: id, action: next ? "completed" : "uncompleted" }).then();
  }, []);

  /* ── Derived ── */
  const byPhase = useMemo(() => {
    const m: Record<Phase, typeof STEPS> = { A: [], B: [], C: [], D: [] };
    for (const s of STEPS) m[s.phase].push(s);
    return m;
  }, []);

  const { blockedIds, availableIds } = useMemo(() => {
    const blocked = new Set<string>(), available = new Set<string>();
    for (const s of STEPS) {
      if (completedIds.has(s.id)) continue;
      s.dependencies.some((d) => !completedIds.has(d)) ? blocked.add(s.id) : available.add(s.id);
    }
    return { blockedIds: blocked, availableIds: available };
  }, [completedIds]);

  const nextStep = useMemo(() => STEPS.find((s) => availableIds.has(s.id)) ?? null, [availableIds]);

  const prevCompletedAt = useMemo(() => {
    const dates = STEPS.filter((s) => completedIds.has(s.id))
      .map((s) => stepRows.get(s.id)?.completed_at).filter(Boolean).sort();
    return dates.length > 0 ? dates[dates.length - 1]! : null;
  }, [completedIds, stepRows]);

  const monthlyBurn = useMemo(
    () => STEPS.filter((s) => completedIds.has(s.id)).reduce((sum, s) => sum + s.monthly_cost, 0),
    [completedIds],
  );

  const completedCount = completedIds.size;
  const phaseStartIdx: Record<Phase, number> = {
    A: 0, B: byPhase.A.length,
    C: byPhase.A.length + byPhase.B.length,
    D: byPhase.A.length + byPhase.B.length + byPhase.C.length,
  };

  /* ── Loading ── */
  if (!loaded) {
    return <main className="mx-auto w-full max-w-[800px] px-5 sm:px-8 pt-12 sm:pt-20 pb-16"><LoadingSkeleton /></main>;
  }

  return (
    <main className="mx-auto w-full max-w-[800px] px-5 sm:px-8 pt-12 sm:pt-20 pb-16">

      {/* ━━ Hero ━━ */}
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-primary bg-primary-light border border-primary/15 px-2.5 py-1 rounded-full mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Implementation Roadmap
        </span>

        {/* Title */}
        <h1 className="text-[2rem] sm:text-[2.75rem] font-bold leading-[1.08] tracking-[-0.025em] text-t-primary">
          Journey Realty Group
        </h1>
        <p className="text-[1.25rem] sm:text-[1.5rem] font-medium leading-[1.2] tracking-[-0.01em] text-t-secondary mt-1.5">
          AI Automation Project
        </p>
        <p className="mt-4 text-[15px] text-t-secondary leading-[1.65] max-w-xl">
          34-step roadmap for building an autonomous AI business operator for a NYC real estate company.
        </p>

        {/* Progress + Phase bars */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-10 items-center">
          <div className="flex justify-center md:justify-start">
            <ProgressRing completed={completedCount} total={STEPS.length} size={200} />
          </div>
          <div className="space-y-3.5">
            {(["A", "B", "C", "D"] as Phase[]).map((p) => {
              const meta = PHASES[p];
              const ps = byPhase[p];
              const done = ps.filter((s) => completedIds.has(s.id)).length;
              const pct = ps.length > 0 ? (done / ps.length) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-[22px] w-[22px] items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: meta.accent }}
                      >{p}</span>
                      <span className="font-semibold text-t-primary">{meta.short}</span>
                    </div>
                    <span className="text-t-muted tabular-nums font-medium">
                      {ps.length > 0 ? `${done}/${ps.length}` : "Later"}
                    </span>
                  </div>
                  <div className="h-[6px] w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.accent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* ━━ Tab Bar ━━ */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ━━ Tab Content ━━ */}
      <AnimatePresence mode="wait">
        {activeTab === "roadmap" && (
          <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <div className="mt-8 mb-10">
              <WhatsNext next={nextStep} prevCompletedAt={prevCompletedAt} />
            </div>
            <div className="space-y-16">
              {(["A", "B", "C"] as Phase[]).map((p) => (
                <PhaseSection
                  key={p} phase={p} steps={byPhase[p]} completedIds={completedIds}
                  currentStepId={nextStep?.id ?? null} blockedIds={blockedIds} availableIds={availableIds}
                  stepRows={stepRows} onToggle={toggle} startIndex={phaseStartIdx[p]}
                />
              ))}
              <PhaseDLocked />
            </div>
          </motion.div>
        )}

        {activeTab === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-8 space-y-12">
            <CostDashboard completedIds={completedIds} stepRows={stepRows} />
            <VelocityTracker completedIds={completedIds} stepRows={stepRows} />
            <CostProjections currentMonthlyBurn={monthlyBurn} />
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-8">
            <ActivityLog logs={activityLogs} />
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "roadmap" && <SectionNav />}
      <Footer />
    </main>
  );
}
