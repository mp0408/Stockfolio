"use client";

import { useInventoryCard } from "./index";
import { Package, AlertTriangle } from "lucide-react";

/**
 * InventoryCard.Body — displays quantity, threshold, and last updated time.
 * Uses tabular/mono numerals for the quantity display.
 */
export function InventoryCardBody() {
  const { product } = useInventoryCard();

  // Format the last updated timestamp
  const lastUpdated = new Date(product.updated_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="mb-4 space-y-3">
      {/* Quantity display — big tabular numbers */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold text-foreground"
          style={{
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {product.quantity}
        </span>
        <span className="text-sm text-text-secondary">units in stock</span>
      </div>

      {/* Threshold + last updated row */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          <span>
            Low stock alert at{" "}
            <span
              className="font-medium text-text-secondary"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {product.low_stock_threshold}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-3 h-3" />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
