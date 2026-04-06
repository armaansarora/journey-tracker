"use client";

export function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Progress ring placeholder */}
      <div className="flex justify-center">
        <div className="h-[200px] w-[200px] rounded-full bg-[#E5E7EB] animate-pulse" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
            <div className="h-3 w-20 rounded bg-[#E5E7EB] animate-pulse" />
            <div className="h-6 w-16 rounded bg-[#E5E7EB] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Step cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white border border-[#E5E7EB] rounded-xl p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#E5E7EB] animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-32 rounded bg-[#E5E7EB] animate-pulse" />
              <div className="h-4 w-48 rounded bg-[#E5E7EB] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
