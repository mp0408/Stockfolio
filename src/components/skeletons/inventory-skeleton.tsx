"use client";

/**
 * Content-shaped skeleton loaders for the inventory grid.
 * Matches the actual card layout with shimmer animation.
 */
export function InventorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-[var(--radius-md)] border border-border bg-surface"
        >
          {/* Header skeleton */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="skeleton h-5 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full ml-3" />
          </div>

          {/* Body skeleton */}
          <div className="mb-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="skeleton h-9 w-16 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <div className="skeleton w-9 h-9 rounded-[var(--radius-sm)]" />
            <div className="skeleton w-9 h-9 rounded-[var(--radius-sm)]" />
            <div className="skeleton h-9 flex-1 rounded-[var(--radius-sm)]" />
            <div className="skeleton w-9 h-9 rounded-[var(--radius-sm)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
