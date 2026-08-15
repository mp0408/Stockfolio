"use client";

import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";

/**
 * Client-side providers wrapper.
 * Wraps the app with AuthProvider (session state) and
 * ToastProvider (notification system).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
