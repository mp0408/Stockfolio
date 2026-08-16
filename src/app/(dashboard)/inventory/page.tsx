"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addProductSchema,
  type AddProductFormData,
} from "@/lib/validators/product";
import { useInventory } from "@/hooks/use-inventory";
import { useDebounce } from "@/hooks/use-debounce";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { useToast } from "@/components/ui/toast";
import { InventoryCard } from "@/components/inventory-card";
import { NoProducts } from "@/components/empty-states/no-products";
import { NoResults } from "@/components/empty-states/no-results";
import { InventorySkeleton } from "@/components/skeletons/inventory-skeleton";
import { getStockStatus } from "@/lib/types";
import type { StockStatus } from "@/lib/types";
import {
  Search,
  Plus,
  X,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

type FilterStatus = "all" | StockStatus;

export default function InventoryPage() {
  const { products, isLoading, error, addProduct, updateStock, deleteProduct, seedDemoProducts } =
    useInventory();
  const { toast } = useToast();
  const summary = useStockSummary(products);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    const { count, error } = await seedDemoProducts();
    setIsSeeding(false);
    if (error) {
      toast({ type: "error", title: "Could not load demo products", description: error });
    } else {
      toast({
        type: "success",
        title: "Demo inventory loaded!",
        description: `Successfully loaded ${count} products into your warehouse.`,
      });
    }
  };

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter products by search and status
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesSku) return false;
      }

      // Status filter
      if (activeFilter !== "all") {
        const status = getStockStatus(product);
        if (status !== activeFilter) return false;
      }

      return true;
    });
  }, [products, debouncedSearch, activeFilter]);

  // Show error toast
  if (error) {
    toast({ type: "error", title: "Inventory error", description: error });
  }

  const filterTabs: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <Package className="w-3.5 h-3.5" /> },
    {
      value: "in_stock",
      label: "In Stock",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    {
      value: "low_stock",
      label: "Low Stock",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    {
      value: "out_of_stock",
      label: "Out of Stock",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* ── Page Header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Inventory
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your products and track stock levels in real time.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5
            rounded-[var(--radius-sm)] font-medium text-sm
            bg-accent text-accent-foreground
            hover:bg-accent-hover active:scale-[0.98]
            transition-default shrink-0
          `}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── Stock Health Summary ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* In Stock */}
        <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-[var(--status-in-stock)] mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              In Stock
            </span>
          </div>
          <p
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {summary.inStock}
            <span className="text-lg text-text-tertiary font-normal ml-1">
              / {summary.total}
            </span>
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${summary.total > 0 ? (summary.inStock / summary.total) * 100 : 0}%`,
                backgroundColor: "var(--status-in-stock)",
              }}
            />
          </div>
        </div>

        {/* Low Stock */}
        <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-[var(--status-low-stock)] mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Low Stock
            </span>
          </div>
          <p
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {summary.lowStock}
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${summary.total > 0 ? (summary.lowStock / summary.total) * 100 : 0}%`,
                backgroundColor: "var(--status-low-stock)",
              }}
            />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="p-5 rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-[var(--status-out-of-stock)] mb-3">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
          <p
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {summary.outOfStock}
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${summary.total > 0 ? (summary.outOfStock / summary.total) * 100 : 0}%`,
                backgroundColor: "var(--status-out-of-stock)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by product name or SKU…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              w-full pl-10 pr-10 py-2.5
              rounded-[var(--radius-sm)] border border-border
              bg-surface text-foreground placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              transition-default
            `}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-default"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex rounded-[var(--radius-sm)] border border-border bg-surface overflow-hidden">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium
                transition-default border-r border-border last:border-r-0
                ${
                  activeFilter === tab.value
                    ? "bg-accent text-accent-foreground"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-foreground"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────── */}
      {isLoading ? (
        <InventorySkeleton />
      ) : products.length === 0 ? (
        <NoProducts
          onAddProduct={() => setShowAddModal(true)}
          onSeedDemo={handleSeedDemo}
          isSeeding={isSeeding}
        />
      ) : filteredProducts.length === 0 ? (
        <NoResults searchQuery={debouncedSearch} activeFilter={activeFilter} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <InventoryCard
              key={product.id}
              product={product}
              onUpdateStock={updateStock}
              onDelete={deleteProduct}
            >
              <InventoryCard.Header />
              <InventoryCard.Body />
              <InventoryCard.Actions />
            </InventoryCard>
          ))}
        </div>
      )}

      {/* ── Add Product Modal ────────────────────── */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={addProduct}
        />
      )}
    </div>
  );
}

/* ── Add Product Modal ───────────────────────────── */

function AddProductModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: AddProductFormData) => Promise<{ error: string | null }>;
}) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      quantity: 0,
      low_stock_threshold: 5,
    },
  });

  const onSubmit = async (data: AddProductFormData) => {
    const { error } = await onAdd(data);
    if (error) {
      toast({ type: "error", title: "Failed to add product", description: error });
    } else {
      toast({ type: "success", title: "Product added", description: `${data.name} is now being tracked.` });
      onClose();
    }
  };

  const inputBase = `
    w-full px-4 py-2.5 rounded-[var(--radius-sm)] border
    bg-surface text-foreground placeholder:text-text-tertiary
    transition-default
    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-surface rounded-[var(--radius-lg)] border border-border
          shadow-[var(--shadow-lg)] w-full max-w-md p-6
        `}
        style={{ animation: "slideUp 200ms ease-out" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Add new product
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-foreground transition-default"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product name */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Product name
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Wireless Bluetooth Speaker"
              className={`${inputBase} ${errors.name ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label
              htmlFor="product-sku"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              SKU
            </label>
            <input
              id="product-sku"
              type="text"
              placeholder="WBS-001"
              className={`${inputBase} font-mono ${errors.sku ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
              style={{ fontFamily: "var(--font-mono)" }}
              {...register("sku")}
            />
            {errors.sku && (
              <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
                {errors.sku.message}
              </p>
            )}
          </div>

          {/* Quantity + Threshold row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="product-quantity"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Initial quantity
              </label>
              <input
                id="product-quantity"
                type="number"
                min={0}
                className={`${inputBase} ${errors.quantity ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-threshold"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Low stock alert
              </label>
              <input
                id="product-threshold"
                type="number"
                min={1}
                className={`${inputBase} ${errors.low_stock_threshold ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
                {...register("low_stock_threshold", { valueAsNumber: true })}
              />
              {errors.low_stock_threshold && (
                <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
                  {errors.low_stock_threshold.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`
                flex-1 px-4 py-2.5 rounded-[var(--radius-sm)]
                border border-border bg-surface
                text-text-secondary hover:bg-surface-secondary hover:text-foreground
                font-medium text-sm transition-default
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-[var(--radius-sm)] font-medium text-sm
                bg-accent text-accent-foreground
                hover:bg-accent-hover active:scale-[0.98]
                transition-default
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? "Adding…" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
