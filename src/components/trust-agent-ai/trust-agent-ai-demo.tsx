"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Bot, CalendarClock, Cpu, RefreshCw, Shield, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { outcomeLabel } from "@/lib/trust-agent-ai/mock-verify";

import { ToastHost } from "./toast-host";
import { TrustAgentAIProvider, useTrustAgentAI } from "./trust-agent-ai-context";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function DemoInner() {
  const { state, toasts, verifying, addBooking, verifyBooking, resetDemo, dismissToast } =
    useTrustAgentAI();

  const [wallet, setWallet] = useState("0x");
  const [meetingTime, setMeetingTime] = useState("");
  const [amount, setAmount] = useState("0.02");
  const [formErr, setFormErr] = useState<string | null>(null);

  const [bid, setBid] = useState("1");
  const [summary, setSummary] = useState("");

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    const w = wallet.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(w)) {
      setFormErr("Enter a valid 0x + 40 hex character address.");
      return;
    }
    if (!meetingTime) {
      setFormErr("Pick a meeting time.");
      return;
    }
    if (!amount.trim() || Number(amount) <= 0) {
      setFormErr("Amount must be a positive SHM number (mock).");
      return;
    }
    addBooking({ employeeWallet: w, meetingTime, amountShm: amount });
    setFormErr(null);
  };

  const runVerify = async () => {
    const id = Number(bid);
    if (!Number.isInteger(id) || id < 1) return;
    await verifyBooking(id, summary);
  };

  const badge = state.lastVerify ? outcomeLabel(state.lastVerify.outcome) : null;

  return (
    <>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-5 text-violet-400" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/90">
                Simulated demo · no wallet or API keys
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              TrustAgent <span className="text-cyan-DEFAULT">AI</span>
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Mock Web3 + AI escrow for startup task verification. All chain calls and LLM reasoning
              are simulated in your browser.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetDemo}
            className="gap-2 border-white/15 bg-white/5 hover:bg-white/10"
          >
            <RefreshCw className="size-3.5" />
            Reset demo data
          </Button>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={container}
        >
          {/* Trust score + activity */}
          <motion.div variants={item} className="flex flex-col gap-6 lg:col-span-1">
            <div className="rounded-xl border border-white/10 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="size-4 text-amber-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-amber-200/90">
                  On-chain Trust Score
                </h2>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tabular-nums text-amber-300">{state.trustScore}</span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.trustScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Adjusts +1 on simulated payout, −1 on refund. Fully local demo.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="size-4 text-cyan-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-200/90">
                  Recent activity
                </h2>
              </div>
              <ul className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1 text-xs">
                {state.activities.slice(0, 10).map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                  >
                    <div className="flex justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                      <span>{new Date(a.ts).toLocaleString()}</span>
                      <span
                        className={cn(
                          a.kind === "verify" ? "text-violet-300" : "text-cyan-300"
                        )}
                      >
                        {a.kind}
                      </span>
                    </div>
                    <p className="mt-0.5 font-medium text-foreground/90">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Booking + AI */}
          <motion.div variants={item} className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock className="size-4 text-cyan-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-200/90">
                  Booking system
                </h2>
              </div>
              <form onSubmit={submitBooking} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Employee wallet</span>
                  <input
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm transition-colors focus:border-cyan-500/50 focus:outline-none"
                    placeholder="0x…"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Meeting time</span>
                  <input
                    type="datetime-local"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm focus:border-cyan-500/50 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Amount (SHM · mock)</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm focus:border-cyan-500/50 focus:outline-none"
                  />
                </label>
                {formErr && <p className="text-sm text-red-400">{formErr}</p>}
                <Button
                  type="submit"
                  className="mt-1 w-full transition-all hover:glow-cyan sm:w-auto"
                >
                  Create booking
                </Button>
              </form>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                Next ID: <span className="text-cyan-300">{state.nextBookingId}</span> · Preloaded: #1
                (success demo), #2 (failure demo)
              </p>
            </div>

            <div
              className={cn(
                "relative overflow-hidden rounded-xl border bg-card/80 p-5 backdrop-blur-sm transition-shadow duration-300",
                verifying
                  ? "border-cyan-400/50 shadow-[0_0_24px_rgba(6,182,212,0.2)]"
                  : "border-white/10"
              )}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl border-2 border-cyan-400/0"
                animate={
                  verifying
                    ? {
                        borderColor: [
                          "rgba(6,182,212,0)",
                          "rgba(6,182,212,0.45)",
                          "rgba(6,182,212,0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.2, repeat: verifying ? Infinity : 0 }}
              />
              <AnimatePresence>
                {verifying && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-violet-400" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-violet-200/90">
                    AI auditor (mocked)
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Try: “<span className="text-foreground/80">completed on time</span>” → payout · “
                  <span className="text-foreground/80">employee absent</span>” → refund · anything
                  else → manual review.
                </p>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Booking ID</span>
                  <input
                    value={bid}
                    onChange={(e) => setBid(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm focus:border-violet-500/50 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Meeting summary</span>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="What happened?"
                    className="resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-violet-500/50 focus:outline-none"
                  />
                </label>
                <Button
                  type="button"
                  disabled={verifying}
                  onClick={runVerify}
                  className="gap-2 bg-violet-600 hover:bg-violet-500"
                >
                  <Cpu className={cn("size-4", verifying && "animate-pulse")} />
                  {verifying ? "Auditing…" : "Verify with AI"}
                </Button>

                <AnimatePresence mode="wait">
                  {state.lastVerify && !verifying && (
                    <motion.div
                      key={state.lastVerify.txHash}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 24 }}
                      className={cn(
                        "mt-2 rounded-lg border p-4",
                        badge === "SUCCESS" &&
                          "border-emerald-500/40 bg-emerald-500/10 glow-green",
                        badge === "REFUND" && "border-red-500/40 bg-red-500/10 glow-red",
                        badge === "REVIEW" && "border-amber-500/40 bg-amber-500/10"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                            badge === "SUCCESS" && "bg-emerald-500/25 text-emerald-300",
                            badge === "REFUND" && "bg-red-500/25 text-red-300",
                            badge === "REVIEW" && "bg-amber-500/25 text-amber-200"
                          )}
                        >
                          {badge}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Simulated {badge === "SUCCESS" ? "payout" : badge === "REFUND" ? "refund" : "hold"}
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground break-all">
                        Tx (fake):{" "}
                        <span className="text-cyan-300/90">{state.lastVerify.txHash}</span>
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {new Date(state.lastVerify.timestamp).toLocaleString()}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Presentation mode */}
            <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 p-5 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Cpu className="size-4 text-violet-300" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-violet-200">
                  Presentation mode
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                <strong className="text-violet-200">TrustAgent AI</strong> analyzes meeting outcomes
                and automatically triggers <em>simulated</em> smart-contract logic for{" "}
                <span className="text-emerald-400">payout</span> or{" "}
                <span className="text-red-400">refund</span>. In production, the same flow would
                call a real oracle and chain — here everything stays local for a frictionless demo.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Live feed full width */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 rounded-xl border border-white/10 bg-card/60 p-5 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <Activity className="size-4 text-cyan-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-200/90">
              Live feed · bookings & verifications
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {state.activities.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-white/5 bg-black/25 px-3 py-2 text-xs"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(a.ts).toLocaleTimeString()}
                </span>
                <p className="font-medium text-foreground/90">{a.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{a.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function TrustAgentAIDemo() {
  return (
    <TrustAgentAIProvider>
      <DemoInner />
    </TrustAgentAIProvider>
  );
}
