"use client";

import { createContext, useContext } from "react";
import type { Product, ChangeType } from "@/lib/types";
import { InventoryCardHeader } from "./header";
import { InventoryCardBody } from "./body";
import { InventoryCardActions } from "./actions";

/* ── Context for compound components ─────────────── */

interface InventoryCardContextValue {
  product: Product;
  onUpdateStock: (
    productId: string,
    delta: number,
    changeType: ChangeType,
    note?: string
  ) => Promise<{ error: string | null }>;
  onDelete: (productId: string) => Promise<{ error: string | null }>;
}

const InventoryCardContext = createContext<InventoryCardContextValue | null>(
  null
);

export function useInventoryCard() {
  const context = useContext(InventoryCardContext);
  if (!context) {
    throw new Error(
      "InventoryCard compound components must be used within <InventoryCard>"
    );
  }
  return context;
}

/* ── Root Component ──────────────────────────────── */

interface InventoryCardProps {
  product: Product;
  onUpdateStock: (
    productId: string,
    delta: number,
    changeType: ChangeType,
    note?: string
  ) => Promise<{ error: string | null }>;
  onDelete: (productId: string) => Promise<{ error: string | null }>;
  children: React.ReactNode;
}

/**
 * Compound component root for inventory product cards.
 *
 * Usage:
 * ```tsx
 * <InventoryCard product={product} onUpdateStock={...} onDelete={...}>
 *   <InventoryCard.Header />
 *   <InventoryCard.Body />
 *   <InventoryCard.Actions />
 * </InventoryCard>
 * ```
 */
function InventoryCardRoot({
  product,
  onUpdateStock,
  onDelete,
  children,
}: InventoryCardProps) {
  return (
    <InventoryCardContext.Provider value={{ product, onUpdateStock, onDelete }}>
      <div
        className={`
          p-5 rounded-[var(--radius-md)] border border-border bg-surface
          shadow-[var(--shadow-sm)]
          hover:shadow-[var(--shadow-md)] hover:border-border-hover
          transition-default
          group
        `}
      >
        {children}
      </div>
    </InventoryCardContext.Provider>
  );
}

/* ── Export as compound component ─────────────────── */

export const InventoryCard = Object.assign(InventoryCardRoot, {
  Header: InventoryCardHeader,
  Body: InventoryCardBody,
  Actions: InventoryCardActions,
});
