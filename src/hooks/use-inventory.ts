"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import type { Product, ChangeType } from "@/lib/types";

interface UseInventoryReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (data: {
    name: string;
    sku: string;
    quantity: number;
    low_stock_threshold: number;
  }) => Promise<{ error: string | null }>;
  updateStock: (
    productId: string,
    delta: number,
    changeType: ChangeType,
    note?: string
  ) => Promise<{ error: string | null }>;
  deleteProduct: (productId: string) => Promise<{ error: string | null }>;
  seedDemoProducts: () => Promise<{ count: number; error: string | null }>;
  refetch: () => Promise<void>;
}

/**
 * Inventory management hook.
 * Fetches products for the user's store, provides CRUD operations
 * with optimistic UI updates, auto-seeding on first login, and audit logging.
 */
export function useInventory(): UseInventoryReturn {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedAutoSeed = useRef(false);

  const supabase = createClient();

  /**
   * Seed demo inventory items (20 shoes & bags) into the user's store.
   */
  const seedDemoProducts = useCallback(async (): Promise<{ count: number; error: string | null }> => {
    if (!profile?.store_id || !user) {
      return { count: 0, error: "No active store or session found." };
    }

    setIsLoading(true);

    const { data: existing } = await supabase
      .from("products")
      .select("sku")
      .eq("store_id", profile.store_id);

    const existingSkus = new Set((existing || []).map((p) => p.sku));
    const toInsert = DEMO_PRODUCTS.filter((p) => !existingSkus.has(p.sku)).map((p) => ({
      store_id: profile.store_id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      low_stock_threshold: p.low_stock_threshold,
    }));

    if (toInsert.length === 0) {
      setIsLoading(false);
      return { count: 0, error: "Demo products are already loaded in this store." };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert(toInsert)
      .select();

    if (insertErr) {
      setIsLoading(false);
      return { count: 0, error: insertErr.message };
    }

    if (inserted && inserted.length > 0) {
      const logs = inserted.map((p) => ({
        product_id: p.id,
        store_id: profile.store_id,
        change_type: "manual_adjust" as const,
        quantity_delta: p.quantity,
        note: "Initial demo inventory loaded",
        created_by: user.id,
      }));
      await supabase.from("inventory_logs").insert(logs);
    }

    const { data: refreshed } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("created_at", { ascending: false });

    setProducts((refreshed as Product[]) || []);
    setIsLoading(false);
    return { count: inserted?.length || 0, error: null };
  }, [profile?.store_id, user, supabase]);

  /**
   * Fetch all products for the current user's store.
   */
  const fetchProducts = useCallback(async () => {
    if (!profile?.store_id) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load inventory. Please try refreshing the page.");
      setIsLoading(false);
      return;
    }

    const loadedProducts = (data as Product[]) || [];
    setProducts(loadedProducts);
    setIsLoading(false);

    // If store has 0 products on initial login/load, auto-seed the 20 Shoes & Bags catalog
    if (loadedProducts.length === 0 && !hasAttemptedAutoSeed.current && user) {
      hasAttemptedAutoSeed.current = true;
      seedDemoProducts();
    }
  }, [profile?.store_id, user, supabase, seedDemoProducts]);

  // Fetch products when the profile loads
  useEffect(() => {
    if (profile?.store_id) {
      fetchProducts();
    } else if (profile) {
      setIsLoading(false);
    }
  }, [profile, fetchProducts]);

  /**
   * Add a new product to the inventory.
   */
  const addProduct = useCallback(
    async (data: {
      name: string;
      sku: string;
      quantity: number;
      low_stock_threshold: number;
    }): Promise<{ error: string | null }> => {
      if (!profile?.store_id) {
        return { error: "No store found. Please contact support." };
      }

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          store_id: profile.store_id,
          name: data.name,
          sku: data.sku,
          quantity: data.quantity,
          low_stock_threshold: data.low_stock_threshold,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          return { error: "A product with this SKU already exists in your store." };
        }
        return { error: "Failed to add product. Please try again." };
      }

      // Add to local state (optimistic)
      setProducts((prev) => [newProduct as Product, ...prev]);

      // Log the creation
      if (user) {
        await supabase.from("inventory_logs").insert({
          product_id: newProduct.id,
          store_id: profile.store_id,
          change_type: "manual_adjust",
          quantity_delta: data.quantity,
          note: "Initial stock added",
          created_by: user.id,
        });
      }

      return { error: null };
    },
    [profile?.store_id, user, supabase]
  );

  /**
   * Update stock quantity with optimistic UI and audit logging.
   */
  const updateStock = useCallback(
    async (
      productId: string,
      delta: number,
      changeType: ChangeType,
      note?: string
    ): Promise<{ error: string | null }> => {
      if (!profile?.store_id || !user) {
        return { error: "Authentication required." };
      }

      // Find current product
      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { error: "Product not found." };
      }

      const newQuantity = Math.max(0, product.quantity + delta);

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, quantity: newQuantity, updated_at: new Date().toISOString() }
            : p
        )
      );

      // Update in database
      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", productId);

      if (updateError) {
        // Rollback optimistic update
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? product : p))
        );
        return { error: "Failed to update stock. Change has been reverted." };
      }

      // Write audit log
      await supabase.from("inventory_logs").insert({
        product_id: productId,
        store_id: profile.store_id,
        change_type: changeType,
        quantity_delta: delta,
        note: note || null,
        created_by: user.id,
      });

      return { error: null };
    },
    [products, profile?.store_id, user, supabase]
  );

  /**
   * Delete a product from the inventory.
   */
  const deleteProduct = useCallback(
    async (productId: string): Promise<{ error: string | null }> => {
      // Optimistic removal
      const removedProduct = products.find((p) => p.id === productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (deleteError) {
        // Rollback
        if (removedProduct) {
          setProducts((prev) => [removedProduct, ...prev]);
        }
        return { error: "Failed to delete product. Please try again." };
      }

      return { error: null };
    },
    [products, supabase]
  );

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateStock,
    deleteProduct,
    seedDemoProducts,
    refetch: fetchProducts,
  };
}
