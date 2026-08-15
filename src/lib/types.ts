/**
 * Database type definitions for Stockfolio.
 * These mirror the Supabase schema and provide type safety
 * across the application without needing generated types.
 */

export type UserRole = "manager" | "staff";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type ChangeType = "increase" | "decrease" | "reorder" | "manual_adjust";

/* ── Tables ──────────────────────────────────────── */

export interface Store {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  store_id: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  store_id: string;
  change_type: ChangeType;
  quantity_delta: number;
  note: string | null;
  created_by: string;
  created_at: string;
}

/* ── Derived helpers ─────────────────────────────── */

/**
 * Derives the stock status from a product's quantity
 * relative to its low_stock_threshold.
 * This is always computed, never stored in the DB.
 */
export function getStockStatus(product: Product): StockStatus {
  if (product.quantity <= 0) return "out_of_stock";
  if (product.quantity <= product.low_stock_threshold) return "low_stock";
  return "in_stock";
}

/**
 * Returns a human-readable label for a stock status.
 */
export function getStockStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  };
  return labels[status];
}
