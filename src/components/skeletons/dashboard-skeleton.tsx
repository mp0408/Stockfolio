"use client";

// Skeleton for the sidebar during auth loading
export function DashboardSidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 border-r border-border bg-surface shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="skeleton w-8 h-8 rounded-[var(--radius-sm)]" />
          <div className="skeleton h-5 w-24 rounded" />
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-3 px-2 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-10 rounded-[var(--radius-sm)]" />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="skeleton h-9 w-9 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    </aside>
  );
}

// Skeleton for the main content area
export function DashboardContentSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Page title */}
      <div>
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[var(--radius-md)] border border-border bg-surface"
          >
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[var(--radius-md)] border border-border bg-surface"
          >
            <div className="skeleton h-4 w-32 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton h-12 rounded-[var(--radius-sm)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
