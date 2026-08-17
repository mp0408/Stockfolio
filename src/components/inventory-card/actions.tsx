"use client";

import { useState } from "react";
import { useInventoryCard } from "./index";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  Loader2,
} from "lucide-react";

/**
 * InventoryCard.Actions — increase/decrease stock, mark reordered, delete.
 * All actions write to inventory_logs for audit trail.
 * Deletion is restricted strictly to Warehouse Managers.
 */
export function InventoryCardActions() {
  const { product, onUpdateStock, onDelete } = useInventoryCard();
  const { profile } = useAuth();
  const isManager = profile?.role === "manager";
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (
    action: string,
    fn: () => Promise<{ error: string | null }>
  ) => {
    setLoadingAction(action);
    const { error } = await fn();
    setLoadingAction(null);

    if (error) {
      toast({ type: "error", title: "Action failed", description: error });
    }
  };

  const isLoading = loadingAction !== null;

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-border">
      {/* Decrease stock */}
      <button
        onClick={() =>
          handleAction("decrease", () =>
            onUpdateStock(product.id, -1, "decrease", "Decreased by 1")
          )
        }
        disabled={isLoading || product.quantity <= 0}
        className={`
          flex items-center justify-center w-9 h-9
          rounded-[var(--radius-sm)] border border-border
          bg-surface hover:bg-surface-secondary
          text-text-secondary hover:text-foreground
          transition-default
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        aria-label="Decrease stock by 1"
        title="Decrease stock"
      >
        {loadingAction === "decrease" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </button>

      {/* Increase stock */}
      <button
        onClick={() =>
          handleAction("increase", () =>
            onUpdateStock(product.id, 1, "increase", "Increased by 1")
          )
        }
        disabled={isLoading}
        className={`
          flex items-center justify-center w-9 h-9
          rounded-[var(--radius-sm)] border border-border
          bg-surface hover:bg-surface-secondary
          text-text-secondary hover:text-foreground
          transition-default
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        aria-label="Increase stock by 1"
        title="Increase stock"
      >
        {loadingAction === "increase" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </button>

      {/* Mark as reordered */}
      <button
        onClick={() =>
          handleAction("reorder", async () => {
            const result = await onUpdateStock(
              product.id,
              0,
              "reorder",
              "Marked as reordered"
            );
            if (!result.error) {
              toast({
                type: "info",
                title: "Reorder logged",
                description: `${product.name} has been marked as reordered.`,
              });
            }
            return result;
          })
        }
        disabled={isLoading}
        className={`
          flex-1 flex items-center justify-center gap-1.5 h-9 px-3
          rounded-[var(--radius-sm)] border border-border
          bg-surface hover:bg-accent-light
          text-text-secondary hover:text-accent
          text-xs font-medium
          transition-default
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        aria-label="Mark as reordered"
        title="Mark as reordered"
      >
        {loadingAction === "reorder" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RotateCcw className="w-3.5 h-3.5" />
        )}
        Reorder
      </button>

      {/* Delete product — Managers only */}
      {isManager && (
        <button
          onClick={() =>
            handleAction("delete", async () => {
              const result = await onDelete(product.id);
              if (!result.error) {
                toast({
                  type: "success",
                  title: "Product removed",
                  description: `${product.name} has been deleted.`,
                });
              }
              return result;
            })
          }
          disabled={isLoading}
          className={`
            flex items-center justify-center w-9 h-9
            rounded-[var(--radius-sm)] border border-border
            bg-surface hover:bg-status-out-of-stock-bg
            text-text-tertiary hover:text-[var(--status-out-of-stock)]
            transition-default
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
          aria-label="Delete product"
          title="Delete product (Manager only)"
        >
          {loadingAction === "delete" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
