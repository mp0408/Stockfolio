"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, Package } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { UserBadge } from "@/components/ui/user-badge";
import {
  DashboardHeaderSkeleton,
  DashboardContentSkeleton,
} from "@/components/skeletons/dashboard-skeleton";

/**
 * Protected dashboard layout.
 * Shows a skeleton while checking auth, redirects to login if
 * not authenticated, otherwise renders the dashboard shell.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, store, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Show skeleton while loading auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeaderSkeleton />
        <DashboardContentSkeleton />
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeaderSkeleton />
        <DashboardContentSkeleton />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Dashboard Header ──────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent flex items-center justify-center">
              <Package className="w-4 h-4 text-accent-foreground" />
            </div>
            <span
              className="text-xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Stockfolio
            </span>
          </div>

          {/* Right side: dark mode + user + sign out */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />

            <div className="w-px h-8 bg-border hidden sm:block" />

            <UserBadge
              fullName={profile.full_name}
              role={profile.role}
              storeName={store?.name}
              avatarUrl={profile.avatar_url}
            />

            <button
              onClick={handleSignOut}
              className={`
                flex items-center justify-center w-9 h-9
                rounded-[var(--radius-sm)] border border-border
                bg-surface hover:bg-status-out-of-stock-bg
                text-text-secondary hover:text-[var(--status-out-of-stock)]
                transition-default
              `}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────── */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
