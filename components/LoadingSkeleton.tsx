export default function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 animate-pulse">
      {/* Ring placeholder */}
      <div className="flex justify-center mb-10">
        <div className="h-[200px] w-[200px] rounded-full bg-[#E2E8F0]" />
      </div>

      {/* Phase bars */}
      <div className="flex flex-col gap-3 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-[#E2E8F0]"
            style={{ width: `${80 - i * 12}%` }}
          />
        ))}
      </div>

      {/* KPI cards -- 2x2 mobile, 4-col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-card bg-[#E2E8F0]" />
        ))}
      </div>

      {/* Step card skeletons */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border p-card">
            <div className="h-3 w-20 rounded bg-[#E2E8F0] mb-3" />
            <div className="h-5 w-3/4 rounded bg-[#E2E8F0] mb-2" />
            <div className="h-3 w-full rounded bg-[#E2E8F0] mb-1.5" />
            <div className="h-3 w-5/6 rounded bg-[#E2E8F0]" />
          </div>
        ))}
      </div>
    </div>
  );
}
