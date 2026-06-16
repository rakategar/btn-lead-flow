import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("panel p-5 space-y-3", className)} aria-busy="true" aria-label="Memuat...">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg skeleton-shimmer" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-24 rounded skeleton-shimmer" />
          <div className="h-2.5 w-16 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="h-7 w-32 rounded skeleton-shimmer" />
      <div className="h-2.5 w-full rounded skeleton-shimmer" />
      <div className="h-2.5 w-3/4 rounded skeleton-shimmer" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="panel overflow-hidden" aria-busy="true" aria-label="Memuat...">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={cn("h-3 rounded skeleton-shimmer", i === 0 ? "w-32" : i === cols - 1 ? "w-16 ml-auto" : "flex-1")} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 px-4 py-3.5 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className={cn("h-3 rounded skeleton-shimmer", colIdx === 0 ? "w-32" : colIdx === cols - 1 ? "w-16 ml-auto" : "flex-1")} style={{ opacity: 1 - rowIdx * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3 px-4", className)}>
      <div className="h-8 w-8 rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded skeleton-shimmer" />
        <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
      </div>
      <div className="h-6 w-16 rounded-full skeleton-shimmer" />
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("panel p-5", className)} aria-busy="true">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded skeleton-shimmer" />
          <div className="h-3 w-20 rounded skeleton-shimmer" />
        </div>
        <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
      </div>
      <div className="h-48 w-full rounded-lg skeleton-shimmer" />
    </div>
  );
}

export function SkeletonKpiCard({ className }: { className?: string }) {
  return (
    <div className={cn("kpi-card space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
      </div>
      <div className="h-8 w-20 rounded skeleton-shimmer" />
      <div className="h-2.5 w-3/4 rounded skeleton-shimmer" />
    </div>
  );
}
