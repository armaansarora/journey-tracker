/** Format currency — whole dollars omit cents, fractional show .XX */
export function fmtCost(n: number): string {
  const r = Math.round(n * 100) / 100;
  if (r === 0) return "$0";
  if (Number.isInteger(r)) return `$${r}`;
  return `$${r.toFixed(2)}`;
}

/** Format a date as "MMM D, YYYY" */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Format a date as "MMM D, h:mm A" */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/** Human-readable duration from ms */
export function fmtDuration(ms: number): string {
  if (ms < 0) return "";
  const mins = Math.floor(ms / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) {
    const rh = hrs - days * 24;
    return rh > 0 ? `${days}d ${rh}h` : `${days}d`;
  }
  if (hrs > 0) {
    const rm = mins - hrs * 60;
    return rm > 0 ? `${hrs}h ${rm}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

/** Months elapsed between two dates (fractional) */
export function monthsBetween(from: string, to: Date): number {
  const d = new Date(from);
  const diffMs = to.getTime() - d.getTime();
  return Math.max(0, diffMs / (30.44 * 24 * 60 * 60 * 1000));
}
