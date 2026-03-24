"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JudgeMeetingPanel() {
  const [bookingId, setBookingId] = useState("1");
  const [summary, setSummary] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    meetingSuccessful?: boolean;
    reason?: string;
    proofOfAction?: string;
    explorerUrl?: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const runJudge = useCallback(async () => {
    setErr(null);
    setResult(null);
    const id = Number(bookingId);
    if (!Number.isInteger(id) || id < 1) {
      setErr("Enter a valid booking ID (integer ≥ 1).");
      return;
    }
    if (!summary.trim()) {
      setErr("Paste a meeting summary to audit.");
      return;
    }

    setScanning(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, meetingSummary: summary.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details ?? data.error ?? "Request failed");
      }
      setResult({
        ok: true,
        meetingSuccessful: data.meetingSuccessful,
        reason: data.reason,
        proofOfAction: data.proofOfAction,
        explorerUrl: data.explorerUrl,
      });
      if (data.meetingSuccessful) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.55 },
          colors: ["#06b6d4", "#22c55e", "#a855f7"],
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setScanning(false);
    }
  }, [bookingId, summary]);

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-xl border border-white/10 bg-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Audit pulse border while scanning */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-cyan-400/0"
        animate={
          scanning
            ? {
                borderColor: ["rgba(6,182,212,0)", "rgba(6,182,212,0.55)", "rgba(6,182,212,0)"],
                boxShadow: [
                  "0 0 0 0 rgba(6,182,212,0)",
                  "0 0 24px 2px rgba(6,182,212,0.35)",
                  "0 0 0 0 rgba(6,182,212,0)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.2, repeat: scanning ? Infinity : 0, ease: "easeInOut" }}
      />

      {/* Scanline */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-400" />
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-violet-300">
            AI Auditor (Module C)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Demo: try &quot;The employee didn&apos;t show up.&quot; → refund path. Or describe a
          successful call → payout + reputation.
        </p>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Booking ID</span>
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Meeting summary / notes</span>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What happened in the meeting?"
            className="resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </label>

        <Button
          type="button"
          onClick={runJudge}
          disabled={scanning}
          className="relative gap-2 overflow-hidden"
        >
          {scanning ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <ScanLine className="size-4" />
              Verify with AI
            </>
          )}
        </Button>

        {err && (
          <p className="whitespace-pre-wrap rounded-lg border border-red-500/25 bg-red-500/5 p-3 text-sm text-red-300/95">
            {err}
          </p>
        )}

        <AnimatePresence mode="wait">
          {result?.ok && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className={cn(
                "flex flex-col gap-2 rounded-lg border border-green-500/40 bg-green-500/10 p-4",
                result.meetingSuccessful && "shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              )}
            >
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1.15, 1] }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="size-5 text-green-400" />
                <span className="font-mono text-sm font-bold uppercase tracking-wide text-green-400">
                  Verified on Shardeum
                </span>
              </motion.div>
              <p className="text-sm text-foreground/90">
                Outcome:{" "}
                <strong>{result.meetingSuccessful ? "Success (payout)" : "Refund"}</strong>
              </p>
              <p className="text-xs text-muted-foreground">{result.reason}</p>
              {result.proofOfAction && (
                <p className="font-mono text-[10px] leading-relaxed text-muted-foreground break-all">
                  Proof of Action (SHA-256):{" "}
                  <span className="text-cyan-300/90">{result.proofOfAction}</span>
                </p>
              )}
              {result.explorerUrl && (
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-cyan-400 underline"
                >
                  View transaction →
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
