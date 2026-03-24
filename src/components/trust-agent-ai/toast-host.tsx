"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ToastMessage } from "./trust-agent-ai-context";

export function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md",
              t.variant === "success" &&
                "border-emerald-500/40 bg-emerald-950/90 text-emerald-50",
              t.variant === "error" &&
                "border-red-500/40 bg-red-950/90 text-red-50",
              t.variant === "info" && "border-cyan-500/35 bg-slate-950/90 text-slate-100"
            )}
          >
            {t.variant === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />}
            {t.variant === "error" && <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />}
            {t.variant === "info" && <Info className="mt-0.5 size-4 shrink-0 text-cyan-400" />}
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
