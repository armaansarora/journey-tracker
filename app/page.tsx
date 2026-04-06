"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type StepRow, type ActivityLogRow } from "@/lib/supabase";
import { STEPS, PHASES, type Phase } from "@/lib/steps";
import { ProgressRing } from "@/components/ProgressRing";
import { WhatsNext } from "@/components/WhatsNext";
import { PhaseSection } from "@/components/PhaseSection";
import { PhaseDLocked } from "@/components/PhaseDLocked";
import { CostDashboard } from "@/components/CostDashboard";
import { VelocityTracker } from "@/components/VelocityTracker";
import { CostProjections } from "@/components/CostProjections";
import { ActivityLog } from "@/components/ActivityLog";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TabBar, type Tab } from "@/components/TabBar";
import { SectionNav } from "@/components/SectionNav";
import { Footer } from "@/components/Footer";

type RowData = { completed_at: string | null; notes: string };

export default function HomePage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [stepRows, setStepRows] = useState<Map<string, RowData>>(new Map());
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("roadmap");

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

    const stepChannel = supabase.channel("steps-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "steps" }, (payload) => {
        const row = payload.new as StepRow | undefined;
        if (!row?.id) return;
        setCompletedIds((prev) => { const n = new Set(prev); if (row.completed) n.add(row.id); else n.delete(row.id); return n; });
        setStepRows((prev) => { const n = new Map(prev); n.set(row.id, { completed_at: row.completed_at, notes: row.notes ?? "" }); return n; });
      }).subscribe();

    const logChannel = supabase.channel("activity-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        const row = payload.new as ActivityLogRow | undefined;
        if (row) setActivityLogs((prev) => [row, ...prev]);
      }).subscribe();

    return () => { mounted = false; supabase.removeChannel(stepChannel); supabase.removeChannel(logChannel); };
  }, []);

  const toggle = useCallback(async (id: string, nextCompleted: boolean) => {
    const now = new Date().toISOString();
    setCompletedIds((prev) => { const n = new Set(prev); if (nextCompleted) n.add(id); else n.delete(id); return n; });
    setStepRows((prev) => { const n = new Map(prev); const old = n.get(id); n.set(id, { ...(old ?? { notes: "" }), completed_at: nextCompleted ? now : null }); return n; });

    const { error } = await supabase.from("steps").upsert(
      { id, completed: nextCompleted, completed_at: nextCompleted ? now : null, updated_at: now },
      { onConflict: "id" },
    );
    if (error) {
      setCompletedIds((prev) => { const n = new Set(prev); if (nextCompleted) n.delete(id); else n.add(id); return n; });
      return;
    }
    supabase.from("activity_log").insert({ step_id: id, action: nextCompleted ? "completed" : "uncompleted" }).then();
  }, []);

  // Derived
  const byPhase = useMemo(() => {
    const m: Record<Phase, typeof STEPS> = { A: [], B: [], C: [], D: [] };
    for (const s of STEPS) m[s.phase].push(s);
    return m;
  }, []);

  const { blockedIds, availableIds } = useMemo(() => {
    const blocked = new Set<string>(), available = new Set<string>();
    for (const s of STEPS) {
      if (completedIds.has(s.id)) continue;
      if (s.dependencies.some((d) => !completedIds.has(d))) blocked.add(s.id);
      else available.add(s.id);
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

  const total = STEPS.length;
  const completedCount = completedIds.size;
  const phaseStartIndex: Record<Phase, number> = {
    A: 0, B: byPhase.A.length,
    C: byPhase.A.length + byPhase.B.length,
    D: byPhase.A.length + byPhase.B.length + byPhase.C.length,
  };

  if (!loaded) {
    return <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12"><LoadingSkeleton /></main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Implementation Roadmap
          </span>
        </div>
        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#111827]">
          Journey Realty Group
        </h1>
        <p className="text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] font-medium leading-[1.15] tracking-[-0.015em] text-[#6B7280] mt-1">
          AI Automation Project
        </p>
        <p className="mt-5 text-[15px] sm:text-[17px] text-[#6B7280] leading-[1.65] max-w-2xl">
          Building an autonomous AI business operator for a NYC real estate company. 34 steps across 4 phases.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 md:gap-10 items-center">
          <div className="flex justify-center md:justify-start">
            <ProgressRing completed={completedCount} total={total} size={200} />
          </div>
          <div className="space-y-4">
            {(["A", "B", "C", "D"] as Phase[]).map((p) => {
              const meta = PHASES[p];
              const ps = byPhase[p];
              const done = ps.filter((s) => completedIds.has(s.id)).length;
              const pct = ps.length > 0 ? (done / ps.length) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-[13px] sm:text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: meta.accent }}>{p}</span>
                      <span className="font-semibold text-[#111827]">{meta.short}</span>
                    </div>
                    <span className="text-[#6B7280] tabular-nums font-medium">
                      {ps.length > 0 ? `${done} / ${ps.length}` : "Later"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full rounded-full" style={{ backgroundColor: meta.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "roadmap" && (
          <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="mt-8 mb-12">
              <WhatsNext next={nextStep} prevCompletedAt={prevCompletedAt} />
            </div>
            <div className="space-y-16 sm:space-y-20">
              {(["A", "B", "C"] as Phase[]).map((p) => (
                <PhaseSection key={p} phase={p} steps={byPhase[p]} completedIds={completedIds}
                  currentStepId={nextStep?.id ?? null} blockedIds={blockedIds} availableIds={availableIds}
                  stepRows={stepRows} onToggle={toggle} startIndex={phaseStartIndex[p]} />
              ))}
              <PhaseDLocked />
            </div>
          </motion.div>
        )}

        {activeTab === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-8 space-y-12">
            <CostDashboard completedIds={completedIds} stepRows={stepRows} />
            <VelocityTracker completedIds={completedIds} stepRows={stepRows} />
            <CostProjections currentMonthlyBurn={monthlyBurn} />
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-8">
            <ActivityLog logs={activityLogs} />
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "roadmap" && <SectionNav />}
      <Footer />
    </main>
  );
}
