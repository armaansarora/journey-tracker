"use client";

import { motion } from "framer-motion";
import { STEPS, PHASES, type Phase } from "@/lib/steps";
import { fmtDate } from "@/lib/utils";

type Props = {
  completedIds: Set<string>;
  stepRows: Map<string, { completed_at: string | null }>;
  projectStartDate: string | null;
};

const TOTAL_WEEKS = 20;

const PHASE_WEEKS: Record<Exclude<Phase, "D">, { start: number; end: number }> = {
  A: { start: 0, end: 4 },
  B: { start: 4, end: 13 },
  C: { start: 10, end: 20 },
};

function addWeeks(iso: string, weeks: number): Date {
  const d = new Date(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function weeksBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (7 * 24 * 60 * 60 * 1000);
}

export function PlannedVsActual({ completedIds, stepRows, projectStartDate }: Props) {
  const phases: Exclude<Phase, "D">[] = ["A", "B", "C"];

  // Compute actual date ranges per phase
  function getActualRange(phase: Phase): { first: Date; last: Date } | null {
    const phaseSteps = STEPS.filter((s) => s.phase === phase);
    const dates: Date[] = [];
    for (const step of phaseSteps) {
      const row = stepRows.get(step.id);
      if (row?.completed_at) {
        dates.push(new Date(row.completed_at));
      }
    }
    if (dates.length === 0) return null;
    dates.sort((a, b) => a.getTime() - b.getTime());
    return { first: dates[0], last: dates[dates.length - 1] };
  }

  // Convert a date to percentage position on the 20-week timeline
  function dateToPercent(date: Date): number {
    if (!projectStartDate) return 0;
    const start = new Date(projectStartDate);
    const weeks = weeksBetween(start, date);
    return Math.max(0, Math.min(100, (weeks / TOTAL_WEEKS) * 100));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-lg font-semibold mb-4">Planned vs Actual</h2>

      <div className="space-y-5">
        {phases.map((phase, i) => {
          const pw = PHASE_WEEKS[phase];
          const plannedLeft = (pw.start / TOTAL_WEEKS) * 100;
          const plannedWidth = ((pw.end - pw.start) / TOTAL_WEEKS) * 100;

          const actualRange = getActualRange(phase);
          let actualLeft = 0;
          let actualWidth = 0;
          if (actualRange && projectStartDate) {
            actualLeft = dateToPercent(actualRange.first);
            const actualRight = dateToPercent(actualRange.last);
            actualWidth = Math.max(actualRight - actualLeft, 1); // min 1% so it's visible
          }

          const plannedStartLabel =
            projectStartDate
              ? fmtDate(addWeeks(projectStartDate, pw.start).toISOString())
              : `Week ${pw.start + 1}`;
          const plannedEndLabel =
            projectStartDate
              ? fmtDate(addWeeks(projectStartDate, pw.end).toISOString())
              : `Week ${pw.end}`;

          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3"
            >
              {/* Phase label */}
              <div className="w-20 shrink-0 pt-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: PHASES[phase].accent }}
                >
                  {PHASES[phase].short}
                </span>
              </div>

              {/* Bars */}
              <div className="flex-1 space-y-1.5">
                {/* Planned bar */}
                <div className="relative h-6 w-full rounded bg-gray-100">
                  <div
                    className="absolute top-0 h-full rounded"
                    style={{
                      left: `${plannedLeft}%`,
                      width: `${plannedWidth}%`,
                      backgroundColor: "#E5E7EB",
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 whitespace-nowrap overflow-hidden px-1">
                      {plannedStartLabel} - {plannedEndLabel}
                    </span>
                  </div>
                </div>

                {/* Actual bar */}
                <div className="relative h-6 w-full rounded bg-gray-100">
                  {actualRange && projectStartDate ? (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${actualWidth}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                      className="absolute top-0 h-full rounded"
                      style={{
                        left: `${actualLeft}%`,
                        backgroundColor: PHASES[phase].accent,
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white whitespace-nowrap overflow-hidden px-1">
                        {fmtDate(actualRange.first.toISOString())} -{" "}
                        {fmtDate(actualRange.last.toISOString())}
                      </span>
                    </motion.div>
                  ) : (
                    <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-400">
                      Not started
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Phase D — Locked */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-start gap-3"
        >
          <div className="w-20 shrink-0 pt-1">
            <span className="text-sm font-medium text-gray-400">
              {PHASES.D.short}
            </span>
          </div>
          <div className="flex-1 flex items-center h-6 text-xs text-gray-400">
            Locked
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#E5E7EB" }} />
          Planned
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-600" />
          Actual
        </div>
      </div>
    </motion.div>
  );
}
