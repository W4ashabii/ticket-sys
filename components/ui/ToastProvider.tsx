"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  pushToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((current) => {
      const id = crypto.randomUUID();
      return [...current, { ...toast, id }];
    });
    setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 4_000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-xl border p-4 shadow-modern-lg animate-in fade-in slide-in-from-bottom-4",
              toast.variant === "success" && "border-black/20 bg-white/90 backdrop-blur-sm",
              toast.variant === "error" && "border-black bg-black text-white",
              toast.variant === "info" && "border-black/20 bg-white/90 backdrop-blur-sm"
            )}
          >
            <p className={`text-sm font-semibold ${
              toast.variant === "error" ? "text-white" : "text-black"
            }`}>
              {toast.title}
            </p>
            {toast.description && (
              <p className={`text-xs mt-1 font-normal ${
                toast.variant === "error" ? "text-white/80" : "text-black/60"
              }`}>{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}

