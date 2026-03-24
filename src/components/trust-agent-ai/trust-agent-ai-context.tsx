"use client";

import confetti from "canvas-confetti";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  analyzeMeetingSummary,
  fakeTxHash,
  outcomeLabel,
} from "@/lib/trust-agent-ai/mock-verify";
import { getSeedState } from "@/lib/trust-agent-ai/seed";
import { loadDemoState, resetDemoState, saveDemoState } from "@/lib/trust-agent-ai/storage";
import type { ActivityEntry, Booking, DemoState, VerifyResult } from "@/lib/trust-agent-ai/types";

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface TrustAgentAIContextValue {
  state: DemoState;
  hydrated: boolean;
  toasts: ToastMessage[];
  verifying: boolean;
  addBooking: (input: { employeeWallet: string; meetingTime: string; amountShm: string }) => void;
  verifyBooking: (bookingId: number, summary: string) => Promise<void>;
  resetDemo: () => void;
  dismissToast: (id: number) => void;
}

const TrustAgentAIContext = createContext<TrustAgentAIContextValue | null>(null);

let toastCounter = 0;

export function TrustAgentAIProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<DemoState>(() => getSeedState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [verifying, setVerifying] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(loadDemoState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDemoState(state), 120);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const pushToast = useCallback((message: string, variant: ToastVariant) => {
    const id = ++toastCounter;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addBooking = useCallback(
    (input: { employeeWallet: string; meetingTime: string; amountShm: string }) => {
      setState((prev) => {
        const newId = prev.nextBookingId;
        const booking: Booking = {
          id: newId,
          employeeWallet: input.employeeWallet.trim(),
          meetingTime: input.meetingTime,
          amountShm: input.amountShm.trim(),
          createdAt: new Date().toISOString(),
        };
        const act: ActivityEntry = {
          id: `act-${Date.now()}`,
          ts: booking.createdAt,
          kind: "booking",
          title: "Booking created",
          detail: `ID ${newId} · ${booking.amountShm} SHM (simulated) · ${booking.employeeWallet.slice(0, 6)}…${booking.employeeWallet.slice(-4)}`,
        };
        queueMicrotask(() => {
          pushToast(`Booking #${newId} created — mock escrow locked`, "success");
        });
        return {
          ...prev,
          nextBookingId: newId + 1,
          bookings: [booking, ...prev.bookings],
          activities: [act, ...prev.activities],
        };
      });
    },
    [pushToast]
  );

  const verifyBooking = useCallback(
    async (bookingId: number, summary: string) => {
      const exists = stateRef.current.bookings.some((b) => b.id === bookingId);
      if (!exists) {
        pushToast(`No booking found for ID ${bookingId}`, "error");
        return;
      }
      setVerifying(true);
      try {
        await new Promise((r) => setTimeout(r, 900));
        const outcome = analyzeMeetingSummary(summary);
        const txHash = fakeTxHash();
        const timestamp = new Date().toISOString();
        const summaryPreview =
          summary.trim().length > 80 ? `${summary.trim().slice(0, 80)}…` : summary.trim();

        const result: VerifyResult = {
          bookingId,
          outcome,
          txHash,
          timestamp,
          summaryPreview,
        };

        setState((prev) => {
          let trustScore = prev.trustScore;
          if (outcome === "SUCCESS") trustScore = Math.min(100, trustScore + 1);
          if (outcome === "FAILURE") trustScore = Math.max(0, trustScore - 1);

          const badge = outcomeLabel(outcome);
          const act: ActivityEntry = {
            id: `act-v-${Date.now()}`,
            ts: timestamp,
            kind: "verify",
            title: `AI verified · ${badge}`,
            detail: `Booking #${bookingId} · ${txHash.slice(0, 10)}…${txHash.slice(-6)} · ${summaryPreview}`,
          };

          return {
            ...prev,
            trustScore,
            lastVerify: result,
            activities: [act, ...prev.activities],
          };
        });

        if (outcome === "SUCCESS") {
          confetti({
            particleCount: 90,
            spread: 68,
            origin: { y: 0.55 },
            colors: ["#06b6d4", "#22c55e", "#a855f7"],
          });
          pushToast("Simulated chain: payout to employee", "success");
        } else if (outcome === "FAILURE") {
          pushToast("Simulated chain: refund to company", "info");
        } else {
          pushToast("Manual review — no automatic payout/refund", "info");
        }
      } finally {
        setVerifying(false);
      }
    },
    [pushToast]
  );

  const resetDemo = useCallback(() => {
    const fresh = resetDemoState();
    setState(fresh);
    pushToast("Demo data reset to seed bookings", "info");
  }, [pushToast]);

  const value = useMemo<TrustAgentAIContextValue>(
    () => ({
      state,
      hydrated,
      toasts,
      verifying,
      addBooking,
      verifyBooking,
      resetDemo,
      dismissToast,
    }),
    [state, hydrated, toasts, verifying, addBooking, verifyBooking, resetDemo, dismissToast]
  );

  return (
    <TrustAgentAIContext.Provider value={value}>{children}</TrustAgentAIContext.Provider>
  );
}

export function useTrustAgentAI() {
  const ctx = useContext(TrustAgentAIContext);
  if (!ctx) throw new Error("useTrustAgentAI must be used within TrustAgentAIProvider");
  return ctx;
}
