"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { ChangeType } from "@/lib/types";

export interface ActivityLog {
  id: string;
  product_id: string;
  store_id: string;
  change_type: ChangeType;
  quantity_delta: number;
  note: string | null;
  created_by: string;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
}

// Fetches inventory_logs with product name/sku for the current store
export function useActivityLogs(limit: number = 50): UseActivityLogsReturn {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    if (!profile?.store_id) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("inventory_logs")
      .select("*, products(name, sku)")
      .eq("store_id", profile.store_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fetchError) {
      setError("Failed to load activity logs.");
      setIsLoading(false);
      return;
    }

    // Flatten joined product data
    const mapped = (data || []).map((log: Record<string, unknown>) => {
      const products = log.products as { name: string; sku: string } | null;
      return {
        ...log,
        product_name: products?.name || "Deleted Product",
        product_sku: products?.sku || "N/A",
      };
    }) as ActivityLog[];

    setLogs(mapped);
    setIsLoading(false);
  }, [profile?.store_id, supabase, limit]);

  useEffect(() => {
    if (profile?.store_id) {
      fetchLogs();
    } else if (profile) {
      setIsLoading(false);
    }
  }, [profile, fetchLogs]);

  return { logs, isLoading, error };
}
