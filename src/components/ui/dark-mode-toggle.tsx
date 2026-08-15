"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

/**
 * Dark mode toggle with three states: light, dark, system.
 * Persists choice to localStorage and prevents flash of unstyled content.
 */
export function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Read saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("stockfolio-theme") as Theme | null;
    if (saved) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((t: Theme) => {
    const isDark =
      t === "dark" ||
      (t === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  const cycle = () => {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("stockfolio-theme", next);
  };

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-surface-secondary" />
    );
  }

  const icon =
    theme === "light" ? (
      <Sun className="w-4 h-4" />
    ) : theme === "dark" ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Monitor className="w-4 h-4" />
    );

  const label =
    theme === "light"
      ? "Light mode"
      : theme === "dark"
        ? "Dark mode"
        : "System theme";

  return (
    <button
      onClick={cycle}
      className={`
        flex items-center justify-center w-9 h-9
        rounded-[var(--radius-sm)] border border-border
        bg-surface hover:bg-surface-secondary
        text-text-secondary hover:text-foreground
        transition-default
      `}
      aria-label={`Current: ${label}. Click to switch.`}
      title={label}
    >
      {icon}
    </button>
  );
}
