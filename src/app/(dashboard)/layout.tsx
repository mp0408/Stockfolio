"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import {
  DashboardSidebarSkeleton,
  DashboardContentSkeleton,
} from "@/components/skeletons/dashboard-skeleton";

// Protected dashboard layout with sidebar navigation
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading } = useAuth();
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
      <div className="flex min-h-screen bg-background">
        <DashboardSidebarSkeleton />
        <main className="flex-1 overflow-auto">
          <DashboardContentSkeleton />
        </main>
      </div>
    );
  }

  // Don't render while redirecting
  if (!user || !profile) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebarSkeleton />
        <main className="flex-1 overflow-auto">
          <DashboardContentSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="lg:hidden h-14" /> {/* Spacer for mobile hamburger */}
        {children}
      </main>
    </div>
  );
}
