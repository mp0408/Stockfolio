"use client";

import { Package, Plus, Sparkles, Loader2 } from "lucide-react";

interface NoProductsProps {
  onAddProduct: () => void;
  onSeedDemo?: () => void;
  isSeeding?: boolean;
  isManager?: boolean;
}

/**
 * Empty state shown when a store has no products yet.
 * Role-aware: CTAs are only shown for managers.
 */
export function NoProducts({
  onAddProduct,
  onSeedDemo,
  isSeeding,
  isManager = true,
}: NoProductsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Custom icon container */}
      <div
        className={`
          w-16 h-16 rounded-[var(--radius-lg)] bg-accent-light
          flex items-center justify-center mb-5
          border border-accent/10
        `}
      >
        <Package className="w-8 h-8 text-accent" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        No products yet
      </h3>
      <p className="text-text-secondary max-w-sm mb-6 leading-relaxed">
        {isManager
          ? "Add your first product to start tracking stock levels, or load 20 pre-configured Shoes & Bags demo items to explore the portfolio."
          : "No products currently exist in this store's inventory. Ask your Warehouse Manager to add products or seed the catalog."}
      </p>

      {isManager && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onAddProduct}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5
              rounded-[var(--radius-sm)] font-medium text-sm
              bg-accent text-accent-foreground
              hover:bg-accent-hover active:scale-[0.98]
              transition-default
            `}
          >
            <Plus className="w-4 h-4" />
            Add your first product
          </button>

          {onSeedDemo && (
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5
                rounded-[var(--radius-sm)] font-medium text-sm
                border border-border bg-surface text-foreground
                hover:bg-surface-secondary active:scale-[0.98]
                transition-default disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <Sparkles className="w-4 h-4 text-accent" />
              )}
              {isSeeding ? "Loading demo items…" : "Load 20 Shoes & Bags"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
