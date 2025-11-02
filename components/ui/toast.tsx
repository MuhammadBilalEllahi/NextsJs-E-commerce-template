"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type ToastType = "default" | "success" | "error" | "warning" | "info";

export type ToastOptions = {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  type?: ToastType;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (opts: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (opts: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = {
        id,
        duration: opts.duration ?? 3500,
        type: opts.type ?? "default",
        title: opts.title,
        description: opts.description,
        action: opts.action,
      };
      setToasts((prev) => [...prev, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => dismiss(id), item.duration);
      }
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  const typeStyles: Record<ToastType, string> = {
    default: "bg-card text-foreground border-border",
    success:
      "bg-green-50 text-green-900 border-green-200 dark:bg-green-950/60 dark:text-green-100 dark:border-green-900",
    error:
      "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/60 dark:text-red-100 dark:border-red-900",
    warning:
      "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-100 dark:border-yellow-900",
    info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-900",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col gap-2 items-end p-4 sm:p-6">
        <div className="flex w-full flex-col items-end gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto w-full max-w-sm rounded-md border p-3 shadow-lg transition-all",
                "bg-card text-foreground border-border",
                t.type ? typeStyles[t.type] : undefined
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {t.title && (
                    <div className="font-medium leading-none mb-1">
                      {t.title}
                    </div>
                  )}
                  {t.description && (
                    <div className="text-sm text-muted-foreground">
                      {t.description}
                    </div>
                  )}
                </div>
                {t.action}
                <button
                  onClick={() => dismiss(t.id)}
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const toastPresets = {
  success: (
    toast: ToastContextValue["toast"],
    title: string,
    description?: React.ReactNode
  ) => toast({ type: "success", title, description }),
  error: (
    toast: ToastContextValue["toast"],
    title: string,
    description?: React.ReactNode
  ) => toast({ type: "error", title, description }),
  info: (
    toast: ToastContextValue["toast"],
    title: string,
    description?: React.ReactNode
  ) => toast({ type: "info", title, description }),
  warning: (
    toast: ToastContextValue["toast"],
    title: string,
    description?: React.ReactNode
  ) => toast({ type: "warning", title, description }),
};


