"use client";

import { useMemo } from "react";
import type { Product, StockStatus } from "@/lib/types";
import { getStockStatus } from "@/lib/types";

interface StockSummary {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  healthPercentage: number;
}

/**
 * Memoized stock health summary.
 * Recomputes automatically whenever the products array changes.
 * Returns counts by status and an overall health percentage.
 */
export function useStockSummary(products: Product[]): StockSummary {
  return useMemo(() => {
    const total = products.length;

    if (total === 0) {
      return {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        healthPercentage: 0,
      };
    }

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of products) {
      const status: StockStatus = getStockStatus(product);
      switch (status) {
        case "in_stock":
          inStock++;
          break;
        case "low_stock":
          lowStock++;
          break;
        case "out_of_stock":
          outOfStock++;
          break;
      }
    }

    const healthPercentage = Math.round((inStock / total) * 100);

    return { total, inStock, lowStock, outOfStock, healthPercentage };
  }, [products]);
}
