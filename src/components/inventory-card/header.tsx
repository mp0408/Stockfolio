"use client";

import { useInventoryCard } from "./index";
import { getStockStatus, getStockStatusLabel } from "@/lib/types";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

/**
 * InventoryCard.Header — displays product name, SKU, and status badge.
 * Status is derived from quantity vs threshold, never stored.
 */
export function InventoryCardHeader() {
  const { product } = useInventoryCard();
  const status = getStockStatus(product);
  const label = getStockStatusLabel(status);

  const statusConfig = {
    in_stock: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      className:
        "bg-[var(--status-in-stock-bg)] text-[var(--status-in-stock)] border-[var(--status-in-stock-border)]",
    },
    low_stock: {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      className:
        "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border-[var(--status-low-stock-border)]",
    },
    out_of_stock: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      className:
        "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border-[var(--status-out-of-stock-border)]",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-foreground text-base leading-snug truncate">
          {product.name}
        </h3>
        <p
          className="text-xs text-text-tertiary mt-0.5 font-mono tracking-wider"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {product.sku}
        </p>
      </div>

      {/* Status badge with icon */}
      <span
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1
          rounded-full text-xs font-medium border
          shrink-0
          ${config.className}
        `}
      >
        {config.icon}
        {label}
      </span>
    </div>
  );
}
