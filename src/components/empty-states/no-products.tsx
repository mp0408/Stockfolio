"use client";

import { Package, Plus } from "lucide-react";

interface NoProductsProps {
  onAddProduct: () => void;
}

/**
 * Empty state shown when a store has no products yet.
 * Custom designed with icon, guidance text, and CTA button.
 */
export function NoProducts({ onAddProduct }: NoProductsProps) {
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

      <h3
        className="text-xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "Fraunces, Georgia, serif" }}
      >
        No products yet
      </h3>
      <p className="text-text-secondary max-w-sm mb-6 leading-relaxed">
        Add your first product to start tracking stock levels, get low-stock
        alerts, and keep your inventory portfolio-grade.
      </p>

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
    </div>
  );
}
