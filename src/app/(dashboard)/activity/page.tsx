"use client";

import { useState, useMemo } from "react";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import type { ChangeType } from "@/lib/types";
import {
  Activity,
  Plus,
  Minus,
  RotateCcw,
  Wrench,
  Filter,
} from "lucide-react";

const changeTypeConfig: Record<
  ChangeType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  increase: {
    label: "Increased",
    icon: <Plus className="w-3.5 h-3.5" />,
    color: "text-[var(--status-in-stock)] bg-[var(--status-in-stock-bg)]",
  },
  decrease: {
    label: "Decreased",
    icon: <Minus className="w-3.5 h-3.5" />,
    color: "text-[var(--status-out-of-stock)] bg-[var(--status-out-of-stock-bg)]",
  },
  reorder: {
    label: "Reordered",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    color: "text-accent bg-accent-light",
  },
  manual_adjust: {
    label: "Adjusted",
    icon: <Wrench className="w-3.5 h-3.5" />,
    color: "text-[var(--status-low-stock)] bg-[var(--status-low-stock-bg)]",
  },
};

type FilterType = "all" | ChangeType;

export default function ActivityPage() {
  const { logs, isLoading, error } = useActivityLogs(100);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((log) => log.change_type === filter);
  }, [logs, filter]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};
    for (const log of filteredLogs) {
      const date = new Date(log.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    }
    return Object.entries(groups);
  }, [filteredLogs]);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "increase", label: "Increases" },
    { value: "decrease", label: "Decreases" },
    { value: "reorder", label: "Reorders" },
    { value: "manual_adjust", label: "Adjustments" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Activity
          </h1>
          <p className="text-text-secondary mt-1">
            Audit trail of all inventory changes.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-text-tertiary shrink-0" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-default whitespace-nowrap ${
              filter === opt.value
                ? "bg-accent text-accent-foreground"
                : "bg-surface-secondary text-text-secondary hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 rounded-[var(--radius-sm)]" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <h3
            className="text-xl font-semibold text-foreground mb-2"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            No activity yet
          </h3>
          <p className="text-text-secondary">
            Stock changes and actions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLogs.map(([date, dateLogs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                {dateLogs.map((log) => {
                  const config = changeTypeConfig[log.change_type];
                  const time = new Date(log.created_at).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  );
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-surface border border-border hover:border-border-hover transition-default"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{config.label}</span>
                          {log.quantity_delta !== 0 && (
                            <span className="text-text-secondary">
                              {" "}
                              by{" "}
                              <span
                                className="font-medium"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {Math.abs(log.quantity_delta)}
                              </span>
                            </span>
                          )}
                          <span className="text-text-secondary">
                            {" "}— {log.product_name}
                          </span>
                        </p>
                        {log.note && (
                          <p className="text-xs text-text-tertiary mt-0.5 truncate">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-text-tertiary shrink-0">
                        {time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
