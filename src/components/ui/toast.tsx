"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (params: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* ── Toast Icons ─────────────────────────────────── */

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const typeStyles: Record<ToastType, string> = {
  success:
    "bg-[var(--status-in-stock-bg)] text-[var(--status-in-stock)] border-[var(--status-in-stock-border)]",
  error:
    "bg-[var(--status-out-of-stock-bg)] text-[var(--status-out-of-stock)] border-[var(--status-out-of-stock-border)]",
  warning:
    "bg-[var(--status-low-stock-bg)] text-[var(--status-low-stock)] border-[var(--status-low-stock-border)]",
  info: "bg-accent-light text-accent border-accent/20",
};

/* ── Provider ────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((params: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...params, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container — top right, stacked */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-[var(--radius-md)] border",
              "shadow-[var(--shadow-md)] backdrop-blur-sm",
              "animate-in slide-in-from-right duration-200 ease-out",
              typeStyles[t.type]
            )}
            style={{
              animation: "slideIn 200ms ease-out",
            }}
          >
            <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t.title}</p>
              {t.description && (
                <p className="text-sm opacity-80 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────── */

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
