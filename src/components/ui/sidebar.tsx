"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Brain,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: "AI Insights",
    href: "/ai-insights",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const { profile, store, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Get user initials
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join("")
    : "U";

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-accent-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground tracking-tight truncate">
              Stockfolio
            </span>
          )}
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] hover:bg-surface-secondary text-text-tertiary hover:text-foreground transition-default"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]
                text-sm font-medium transition-default group
                ${collapsed ? "justify-center px-2" : ""}
                ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-foreground"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer — dark mode + user + sign out */}
      <div className="border-t border-border p-3 space-y-2 shrink-0">
        {/* Dark mode toggle row */}
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-1"}`}
        >
          {!collapsed && (
            <span className="text-xs text-text-tertiary">Theme</span>
          )}
          <DarkModeToggle />
        </div>

        {/* User info */}
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-[var(--radius-sm)] ${collapsed ? "justify-center px-0" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                {profile?.role === "manager" ? "Manager" : "Staff"}
                {store?.name && ` · ${store.name}`}
              </p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]
            text-sm font-medium text-text-secondary
            hover:bg-status-out-of-stock-bg hover:text-[var(--status-out-of-stock)]
            transition-default
            ${collapsed ? "justify-center px-2" : ""}
          `}
          title="Sign out"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-[var(--radius-sm)] bg-surface border border-border flex items-center justify-center text-foreground shadow-[var(--shadow-sm)] hover:bg-surface-secondary transition-default"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-overlay"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-surface border-r border-border shadow-[var(--shadow-lg)]"
            style={{ animation: "slideRight 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-[var(--radius-sm)] hover:bg-surface-secondary flex items-center justify-center text-text-tertiary hover:text-foreground transition-default"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-surface
          transition-all duration-200 ease-out shrink-0
          ${collapsed ? "w-[68px]" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
