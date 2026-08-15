"use client";

/**
 * Skeleton loaders for the dashboard layout.
 * Shown during session/auth checks — never a blank screen.
 */

export function DashboardHeaderSkeleton() {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      {/* Logo skeleton */}
      <div className="skeleton h-6 w-28 rounded" />

      {/* Right side: toggle + user badge */}
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-3">
          <div className="skeleton w-9 h-9 rounded-full" />
          <div className="hidden sm:flex flex-col gap-1">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Summary bar skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[var(--radius-md)] border border-border bg-surface"
          >
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-16 rounded mb-2" />
            <div className="skeleton h-2 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Search/filter bar skeleton */}
      <div className="flex gap-3">
        <div className="skeleton h-10 flex-1 rounded-[var(--radius-sm)]" />
        <div className="skeleton h-10 w-32 rounded-[var(--radius-sm)]" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[var(--radius-md)] border border-border bg-surface"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="skeleton h-4 w-32 rounded mb-2" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-8 w-8 rounded" />
              <div className="skeleton h-8 w-8 rounded" />
              <div className="skeleton h-8 flex-1 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
