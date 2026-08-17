"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { getStockStatus } from "@/lib/types";
import type { Product } from "@/lib/types";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  XCircle,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Coins,
} from "lucide-react";
import Link from "next/link";

interface AIReport {
  summary: string;
  urgentActions: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  savingsTip: string;
  source: string;
}

export default function AIInsightsPage() {
  const { products, isLoading } = useInventory();
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fetchAIReport = useCallback(async () => {
    if (products.length === 0) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: products.map((p) => ({
            name: p.name,
            sku: p.sku,
            quantity: p.quantity,
            low_stock_threshold: p.low_stock_threshold,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      }
    } catch (err) {
      console.error("Failed to load AI report:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [products]);

  useEffect(() => {
    if (products.length > 0 && !aiReport) {
      fetchAIReport();
    }
  }, [products, aiReport, fetchAIReport]);

  // Products that need reordering (low stock or out of stock)
  const reorderAlerts = useMemo(() => {
    return products
      .filter((p) => getStockStatus(p) !== "in_stock")
      .sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  // Products losing stock fastest (lowest quantity relative to threshold)
  const fastMovers = useMemo(() => {
    return products
      .filter((p) => p.quantity > 0)
      .map((p) => ({
        ...p,
        ratio: p.quantity / p.low_stock_threshold,
      }))
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 8);
  }, [products]);

  // Estimated reorder urgency based on stock/threshold ratio
  const reorderPredictions = useMemo(() => {
    return products
      .filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold * 2)
      .map((p) => {
        const urgency = p.quantity <= p.low_stock_threshold ? "critical" : "soon";
        const daysEstimate = Math.max(1, Math.round(p.quantity * 2.5));
        return { ...p, urgency, daysEstimate };
      })
      .sort((a, b) => a.daysEstimate - b.daysEstimate)
      .slice(0, 6);
  }, [products]);

  // Category health analysis
  const categoryHealth = useMemo(() => {
    const cats: Record<
      string,
      { total: number; inStock: number; lowStock: number; outOfStock: number }
    > = {};
    for (const p of products) {
      const prefix = p.sku.split("-")[0] || "OTHER";
      if (!cats[prefix])
        cats[prefix] = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
      cats[prefix].total++;
      const status = getStockStatus(p);
      if (status === "in_stock") cats[prefix].inStock++;
      else if (status === "low_stock") cats[prefix].lowStock++;
      else cats[prefix].outOfStock++;
    }
    return Object.entries(cats)
      .map(([name, data]) => ({
        name,
        ...data,
        healthScore: Math.round((data.inStock / data.total) * 100),
      }))
      .sort((a, b) => a.healthScore - b.healthScore);
  }, [products]);

  // Overall insights summary
  const insightsSummary = useMemo(() => {
    const total = products.length;
    if (total === 0) return null;
    const outOfStock = products.filter((p) => p.quantity <= 0).length;
    const lowStock = products.filter(
      (p) => getStockStatus(p) === "low_stock"
    ).length;
    const criticalRatio = ((outOfStock + lowStock) / total) * 100;

    let overallStatus: "good" | "warning" | "critical" = "good";
    if (criticalRatio > 40) overallStatus = "critical";
    else if (criticalRatio > 20) overallStatus = "warning";

    return { total, outOfStock, lowStock, criticalRatio, overallStatus };
  }, [products]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="skeleton h-10 w-48 rounded" />
        <div className="skeleton h-4 w-72 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-64 rounded-[var(--radius-md)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent/10 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                AI Insights
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20">
                <Sparkles className="w-3 h-3" />
                Smart Inventory AI
              </span>
            </div>
            <p className="text-text-secondary mt-1">
              Smart analysis and supply chain intelligence for your inventory.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIReport}
          disabled={isGeneratingAI || products.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] font-medium text-sm bg-surface border border-border text-foreground hover:bg-surface-secondary transition-default disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-accent ${isGeneratingAI ? "animate-spin" : ""}`}
          />
          {isGeneratingAI ? "Analyzing inventory..." : "Refresh Insights"}
        </button>
      </div>

      {/* Strategic Analysis Card */}
      {aiReport && (
        <div className="p-6 rounded-[var(--radius-md)] border border-accent/30 bg-gradient-to-br from-surface to-surface-secondary shadow-[var(--shadow-md)] relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Strategic Inventory Briefing
                </h2>
                <p className="text-xs text-text-tertiary">
                  Powered by Stockfolio Intelligence Engine
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                aiReport.riskLevel === "high"
                  ? "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border border-[var(--status-out-of-stock-border)]"
                  : aiReport.riskLevel === "medium"
                    ? "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border border-[var(--status-low-stock-border)]"
                    : "bg-[var(--status-in-stock-bg)] text-[var(--status-in-stock)] border border-[var(--status-in-stock-border)]"
              }`}
            >
              {aiReport.riskLevel} Risk
            </span>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-5">
            {aiReport.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            {/* Urgent Restock */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--status-out-of-stock)] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                Priority Actions
              </div>
              <ul className="space-y-1.5">
                {aiReport.urgentActions.map((action, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-[var(--status-out-of-stock)] mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                Growth Tactics
              </div>
              <ul className="space-y-1.5">
                {aiReport.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cash Flow Optimization */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--status-in-stock)] uppercase tracking-wider">
                <Coins className="w-4 h-4" />
                Cost Efficiency
              </div>
              <p className="text-xs text-text-secondary leading-relaxed bg-surface/50 p-2.5 rounded-[var(--radius-sm)] border border-border">
                {aiReport.savingsTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall status banner */}
      {insightsSummary && (
        <div
          className={`p-5 rounded-[var(--radius-md)] border ${
            insightsSummary.overallStatus === "critical"
              ? "bg-[var(--status-out-of-stock-bg)] border-[var(--status-out-of-stock-border)]"
              : insightsSummary.overallStatus === "warning"
                ? "bg-[var(--status-low-stock-bg)] border-[var(--status-low-stock-border)]"
                : "bg-[var(--status-in-stock-bg)] border-[var(--status-in-stock-border)]"
          }`}
        >
          <div className="flex items-center gap-3">
            {insightsSummary.overallStatus === "critical" ? (
              <XCircle className="w-5 h-5 text-[var(--status-out-of-stock)] shrink-0" />
            ) : insightsSummary.overallStatus === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-[var(--status-low-stock)] shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-[var(--status-in-stock)] shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {insightsSummary.overallStatus === "critical"
                  ? "Inventory needs immediate attention"
                  : insightsSummary.overallStatus === "warning"
                    ? "Some items need restocking soon"
                    : "Inventory is in good shape"}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {insightsSummary.outOfStock} out of stock, {insightsSummary.lowStock} low
                stock out of {insightsSummary.total} products
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reorder alerts */}
        <InsightCard
          title="Reorder Alerts"
          icon={<ShoppingCart className="w-4 h-4" />}
          badge={reorderAlerts.length > 0 ? `${reorderAlerts.length} items` : undefined}
          badgeColor="warning"
        >
          {reorderAlerts.length === 0 ? (
            <EmptyInsight message="All products are well stocked. No reorders needed." />
          ) : (
            <div className="space-y-2">
              {reorderAlerts.slice(0, 6).map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
              {reorderAlerts.length > 6 && (
                <Link
                  href="/inventory"
                  className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1 pt-2 transition-default"
                >
                  View all {reorderAlerts.length} items <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </InsightCard>

        {/* Stock velocity */}
        <InsightCard
          title="Stock Velocity"
          icon={<TrendingDown className="w-4 h-4" />}
          subtitle="Products closest to running out"
        >
          {fastMovers.length === 0 ? (
            <EmptyInsight message="No products in inventory yet." />
          ) : (
            <div className="space-y-3">
              {fastMovers.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (p.quantity / (p.low_stock_threshold * 3)) * 100)}%`,
                          backgroundColor:
                            p.ratio <= 1
                              ? "var(--status-out-of-stock)"
                              : p.ratio <= 2
                                ? "var(--status-low-stock)"
                                : "var(--status-in-stock)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs text-text-tertiary w-8 text-right"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {p.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InsightCard>

        {/* Predicted reorders */}
        <InsightCard
          title="Reorder Timeline"
          icon={<Zap className="w-4 h-4" />}
          subtitle="Estimated days before reorder needed"
        >
          {reorderPredictions.length === 0 ? (
            <EmptyInsight message="No upcoming reorders predicted." />
          ) : (
            <div className="space-y-2">
              {reorderPredictions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-surface-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {p.quantity} units remaining
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ml-3 shrink-0 ${
                      p.urgency === "critical"
                        ? "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border-[var(--status-out-of-stock-border)]"
                        : "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border-[var(--status-low-stock-border)]"
                    }`}
                  >
                    ~{p.daysEstimate}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </InsightCard>

        {/* Category health */}
        <InsightCard
          title="Category Health"
          icon={<BarChart3 className="w-4 h-4" />}
          subtitle="Health score by product category"
        >
          {categoryHealth.length === 0 ? (
            <EmptyInsight message="No categories to analyze." />
          ) : (
            <div className="space-y-3">
              {categoryHealth.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span
                      className={`text-xs font-semibold ${
                        cat.healthScore >= 80
                          ? "text-[var(--status-in-stock)]"
                          : cat.healthScore >= 50
                            ? "text-[var(--status-low-stock)]"
                            : "text-[var(--status-out-of-stock)]"
                      }`}
                    >
                      {cat.healthScore}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.healthScore}%`,
                        backgroundColor:
                          cat.healthScore >= 80
                            ? "var(--status-in-stock)"
                            : cat.healthScore >= 50
                              ? "var(--status-low-stock)"
                              : "var(--status-out-of-stock)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                    <span>{cat.inStock} in stock</span>
                    <span>{cat.lowStock} low</span>
                    <span>{cat.outOfStock} out</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InsightCard>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  icon,
  subtitle,
  badge,
  badgeColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  badge?: string;
  badgeColor?: "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            {title}
          </h3>
          {badge && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                badgeColor === "danger"
                  ? "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)]"
                  : "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-text-tertiary -mt-2 mb-4">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const isOut = product.quantity <= 0;
  return (
    <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-surface-secondary">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
        <p className="text-xs text-text-tertiary" style={{ fontFamily: "var(--font-mono)" }}>
          {product.sku}
        </p>
      </div>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full border shrink-0 ml-3 ${
          isOut
            ? "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border-[var(--status-out-of-stock-border)]"
            : "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border-[var(--status-low-stock-border)]"
        }`}
      >
        {isOut ? "Out of Stock" : `${product.quantity} left`}
      </span>
    </div>
  );
}

function EmptyInsight({ message }: { message: string }) {
  return (
    <div className="text-center py-6">
      <CheckCircle className="w-6 h-6 text-[var(--status-in-stock)] mx-auto mb-2" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
