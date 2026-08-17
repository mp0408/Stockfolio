"use client";

import { useMemo } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { useAuth } from "@/hooks/use-auth";
import { getStockStatus } from "@/lib/types";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Plus,
  Brain,
} from "lucide-react";

const CATEGORY_NAMES: Record<string, string> = {
  SHO: "Shoes & Footwear",
  BAG: "Bags & Backpacks",
  RUN: "Running Shoes",
  SNK: "Sneakers & Casual",
  FRM: "Formal & Dress Shoes",
  BTS: "Boots & Outdoor",
  SND: "Sandals & Slides",
  TRN: "Training & Gym",
  KID: "Kids Footwear",
};

function formatCategoryName(prefix: string): string {
  return CATEGORY_NAMES[prefix] || prefix;
}

export default function DashboardPage() {
  const { profile, store } = useAuth();
  const { products, isLoading } = useInventory();
  const summary = useStockSummary(products);

  // Top low-stock items that need attention
  const urgentItems = useMemo(() => {
    return products
      .filter((p) => {
        const status = getStockStatus(p);
        return status === "low_stock" || status === "out_of_stock";
      })
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }, [products]);

  // Category breakdown from SKU prefixes
  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, { total: number; healthy: number }> = {};
    for (const product of products) {
      const prefix = product.sku.split("-")[0] || "OTHER";
      if (!categories[prefix]) categories[prefix] = { total: 0, healthy: 0 };
      categories[prefix].total++;
      if (getStockStatus(product) === "in_stock") {
        categories[prefix].healthy++;
      }
    }
    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [products]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-secondary mt-1">
          {store?.name ? `${store.name} — ` : ""}Here&apos;s your inventory at a glance.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Products"
          value={summary.total}
          icon={<Package className="w-4 h-4" />}
          color="accent"
        />
        <SummaryCard
          label="In Stock"
          value={summary.inStock}
          icon={<CheckCircle className="w-4 h-4" />}
          color="in-stock"
          subtitle={`${summary.healthPercentage}% healthy`}
        />
        <SummaryCard
          label="Low Stock"
          value={summary.lowStock}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="low-stock"
        />
        <SummaryCard
          label="Out of Stock"
          value={summary.outOfStock}
          icon={<XCircle className="w-4 h-4" />}
          color="out-of-stock"
        />
      </div>

      {/* Health progress bar */}
      <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              Stock Health
            </span>
          </div>
          <span
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {summary.inStock}
            <span className="text-base text-text-tertiary font-normal">
              {" "}/ {summary.total}
            </span>
          </span>
        </div>
        <div className="h-3 rounded-full bg-surface-secondary overflow-hidden flex">
          {summary.total > 0 && (
            <>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(summary.inStock / summary.total) * 100}%`,
                  backgroundColor: "var(--status-in-stock)",
                }}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(summary.lowStock / summary.total) * 100}%`,
                  backgroundColor: "var(--status-low-stock)",
                }}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(summary.outOfStock / summary.total) * 100}%`,
                  backgroundColor: "var(--status-out-of-stock)",
                }}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-in-stock)]" />
            In Stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-low-stock)]" />
            Low Stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-out-of-stock)]" />
            Out of Stock
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent items */}
        <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Needs Attention
            </h3>
            <Link
              href="/inventory"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-default"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-[var(--radius-sm)]" />
              ))}
            </div>
          ) : urgentItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-[var(--status-in-stock)] mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                All products are well stocked!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentItems.map((product) => {
                const isOut = product.quantity <= 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-surface-secondary"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p
                        className="text-xs text-text-tertiary"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {product.sku}
                      </p>
                    </div>
                    <span
                      className={`
                        text-xs font-medium px-2 py-1 rounded-full border shrink-0 ml-3
                        ${
                          isOut
                            ? "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border-[var(--status-out-of-stock-border)]"
                            : "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border-[var(--status-low-stock-border)]"
                        }
                      `}
                    >
                      {isOut ? "Out" : `${product.quantity} left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Categories
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-8 rounded-[var(--radius-sm)]" />
              ))}
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">
              No products yet
            </p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-text-secondary font-medium">
                      {formatCategoryName(cat.name)}
                    </span>
                    <span
                      className="text-text-tertiary"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {cat.healthy}/{cat.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.total > 0 ? (cat.healthy / cat.total) * 100 : 0}%`,
                        backgroundColor: "var(--status-in-stock)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/inventory"
          className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-border-hover transition-default group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-default">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Add Product
            </p>
            <p className="text-xs text-text-tertiary">
              Track a new item in your inventory
            </p>
          </div>
        </Link>

        <Link
          href="/ai-insights"
          className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-border-hover transition-default group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-default">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI Insights
            </p>
            <p className="text-xs text-text-tertiary">
              Smart stock analysis and recommendations
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Reusable summary card
function SummaryCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    accent: "text-accent",
    "in-stock": "text-[var(--status-in-stock)]",
    "low-stock": "text-[var(--status-low-stock)]",
    "out-of-stock": "text-[var(--status-out-of-stock)]",
  };

  return (
    <div className="p-4 sm:p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className={`flex items-center gap-2 ${colorMap[color]} mb-2`}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className="text-2xl sm:text-3xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
      )}
    </div>
  );
}
