"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Database,
  FileSearch,
  Hash,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Sparkles,
  TriangleAlert,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { keccak256, stringToBytes } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@/components/ui/button";
import { useExecuteTrustAgent } from "@/hooks/use-execute-trust-agent";
import { ACTION_LOG_ABI } from "@/lib/action-log-abi";
import { ACTION_LOG_ADDRESS } from "@/lib/contracts";
import { sha256 } from "@/lib/hash";
import { cn } from "@/lib/utils";
import type { TrustAgentResult } from "@/types";

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono",
        "border border-white/10 text-muted-foreground transition-all hover:border-cyan-border hover:text-cyan-DEFAULT",
        copied && "border-green-500/40 text-green-400",
        className
      )}
      aria-label="Copy"
    >
      <Copy size={9} />
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

// ── Truncated hash display ────────────────────────────────────────────────────

function HashDisplay({ hash }: { hash: string }) {
  return (
    <span className="font-mono text-cyan-DEFAULT text-xs">
      {hash.slice(0, 10)}
      <span className="text-muted-foreground">…</span>
      {hash.slice(-10)}
    </span>
  );
}

// ── Score arc ─────────────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (score / 100) * circ;
  const color = score >= 76 ? "#22c55e" : score >= 51 ? "#f59e0b" : score >= 26 ? "#f97316" : "#ef4444";
  const label = score >= 76 ? "STRONG" : score >= 51 ? "MODERATE" : score >= 26 ? "WEAK" : "POOR";

  return (
    <div className="relative flex flex-col items-center gap-1">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={44} cy={44} r={r} fill="none" strokeWidth={6}
          stroke="rgba(255,255,255,0.06)" />
        <circle cx={44} cy={44} r={r} fill="none" strokeWidth={6}
          stroke={color} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="animate-number-count text-2xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ── Scanning overlay ──────────────────────────────────────────────────────────

type ScanStep = { label: string; done: boolean; active: boolean };

function ScanningPanel({ stage }: { stage: string }) {
  const steps: ScanStep[] = [
    {
      label: "Initializing Trust-Agent neural interface…",
      done: stage !== "analyzing",
      active: stage === "analyzing",
    },
    {
      label: "Routing pitch to GPT-4o · Market-Fit analysis…",
      done: stage === "confirming" || stage === "done",
      active: stage === "submitting",
    },
    {
      label: "Computing SHA-256 of result payload…",
      done: stage === "confirming" || stage === "done",
      active: stage === "submitting",
    },
    {
      label: "Broadcasting logAction() to Shardeum Mezame…",
      done: stage === "done",
      active: stage === "confirming",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-border bg-card">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

      {/* Scan line */}
      <div className="pointer-events-none absolute inset-x-0 h-0.5 animate-scan"
        style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.7), transparent)" }} />

      <div className="relative flex flex-col gap-1 px-5 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-DEFAULT opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-DEFAULT" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-DEFAULT text-glow-cyan">
              SCANNING
            </span>
          </div>
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 font-mono text-[12px] transition-opacity duration-500",
              !step.done && !step.active && "opacity-30",
              step.active && "opacity-100",
              step.done && "opacity-70",
            )}>
              <span className="mt-0.5 shrink-0">
                {step.done ? (
                  <CheckCircle2 size={13} className="text-green-400" />
                ) : step.active ? (
                  <span className="flex h-3 w-3 items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
                  </span>
                ) : (
                  <span className="flex h-3 w-3 items-center justify-center">
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                  </span>
                )}
              </span>
              <span className={cn(
                step.done && "text-muted-foreground line-through decoration-green-500/40",
                step.active && "text-foreground",
                !step.done && !step.active && "text-muted-foreground",
              )}>
                {step.label}
                {step.active && (
                  <span className="ml-0.5 inline-block animate-blink text-cyan-DEFAULT">▌</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Shardeum Mezame · Chain 8119
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date().toISOString().slice(11, 19)} UTC
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Verified badge ────────────────────────────────────────────────────────────

function VerifiedBadge({ actionId }: { actionId: bigint }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border border-green-500/40 px-3 py-1",
      "bg-green-500/10 animate-glow-green"
    )}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
      <ShieldCheck size={12} className="text-green-400" />
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-green-400">
        Verified on Shardeum
      </span>
      <span className="font-mono text-[10px] text-green-400/70">
        ACTION #{String(actionId)}
      </span>
    </div>
  );
}

// ── Verify: local hash + on-chain read ────────────────────────────────────────

type IntegrityState = "idle" | "checking" | "match" | "mismatch" | "error";

function VerifyIntegrityPanel({
  pitch,
  resultJson,
  resultHash,
  taskHash,
  actionId,
}: {
  pitch: string;
  resultJson: string;
  resultHash: string;
  taskHash: `0x${string}`;
  actionId: bigint;
}) {
  const publicClient = usePublicClient();
  const [state, setState] = useState<IntegrityState>("idle");
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [detail, setDetail] = useState<string>("");

  const reset = () => {
    setState("idle");
    setComputedHash(null);
    setDetail("");
  };

  const verify = async () => {
    if (!publicClient) {
      setState("error");
      setDetail("No RPC client — connect wallet / network.");
      return;
    }
    if (ACTION_LOG_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setState("error");
      setDetail("Set NEXT_PUBLIC_ACTION_LOG_ADDRESS in .env.local.");
      return;
    }

    setState("checking");
    setComputedHash(null);
    setDetail("");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const recomputed = await sha256(resultJson);
      setComputedHash(recomputed);
      const hashOk = recomputed === resultHash;

      const pitchBytes = keccak256(stringToBytes(pitch));
      const pitchOk = pitchBytes === taskHash;

      const row = await publicClient.readContract({
        address: ACTION_LOG_ADDRESS,
        abi: ACTION_LOG_ABI,
        functionName: "actions",
        args: [actionId],
      });
      const [chainActor, chainTask, chainResult] = row as [
        `0x${string}`,
        `0x${string}`,
        string,
        bigint,
      ];
      void chainActor;
      const chainOk =
        chainTask.toLowerCase() === taskHash.toLowerCase() &&
        chainResult === resultJson;

      const ok = hashOk && pitchOk && chainOk;
      setDetail(
        [
          `SHA-256(result): ${hashOk ? "OK" : "MISMATCH"}`,
          `keccak256(pitch) ↔ taskHash: ${pitchOk ? "OK" : "MISMATCH"}`,
          `readContract(actions[${actionId}]): ${chainOk ? "OK" : "MISMATCH"}`,
        ].join(" · ")
      );
      setState(ok ? "match" : "mismatch");
    } catch (e) {
      setState("error");
      setDetail(e instanceof Error ? e.message : "Verification failed");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-300",
        state === "match" && "border-green-500/40 bg-green-500/5 glow-green",
        state === "mismatch" && "border-red-500/40 bg-red-500/5 glow-red",
        state === "error" && "border-amber-500/35 bg-amber-500/8",
        (state === "idle" || state === "checking") &&
          "border-white/10 bg-muted/20"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSearch size={14} className="text-muted-foreground" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Verify
          </span>
        </div>

        {state === "idle" && (
          <Button
            variant="outline"
            size="sm"
            onClick={verify}
            className="h-7 gap-1.5 border-white/15 font-mono text-[11px] hover:border-cyan-DEFAULT/50 hover:text-cyan-DEFAULT"
          >
            <Hash size={11} />
            Verify
          </Button>
        )}
        {state === "checking" && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-DEFAULT">
            <Loader2 size={11} className="animate-spin" />
            Hash + on-chain read…
          </div>
        )}
        {(state === "match" || state === "mismatch" || state === "error") && (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            re-check
          </button>
        )}
      </div>

      {(state === "match" || state === "mismatch") && computedHash && (
        <div className="mt-3 flex animate-fade-up flex-col gap-2">
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2.5",
              state === "match"
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            )}
          >
            {state === "match" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-400" />
            ) : (
              <ShieldX size={18} className="mt-0.5 shrink-0 text-red-400" />
            )}
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "font-mono text-[13px] font-bold tracking-wide",
                  state === "match"
                    ? "text-green-400 text-glow-green"
                    : "text-red-400"
                )}
              >
                {state === "match"
                  ? "Data is Untampered"
                  : "Verification failed"}
              </span>
              <span className="text-[11px] text-muted-foreground">{detail}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-white/6 bg-black/20 px-3 py-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">API resultHash</span>
              <HashDisplay hash={resultHash} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Recomputed</span>
              <HashDisplay hash={computedHash} />
            </div>
          </div>
        </div>
      )}

      {state === "error" && (
        <p className="mt-2 text-[11px] text-amber-200/90">{detail}</p>
      )}
    </div>
  );
}

// ── Audit log result card ─────────────────────────────────────────────────────

function AuditLogCard({ result, pitch }: { result: TrustAgentResult; pitch: string }) {
  const ts = new Date().toISOString();

  return (
    <div className="animate-fade-up flex flex-col gap-0 overflow-hidden rounded-xl border border-cyan-border bg-card">
      {/* ── Card header bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-black/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-cyan-DEFAULT" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
            Audit Log
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{"// trust-agent"}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{ts.slice(0, 19)}Z</span>
      </div>

      {/* ── Grid background ──────────────────────────────────────────── */}
      <div className="relative bg-grid">
        <div className="flex flex-col gap-5 px-5 py-5">

          {/* Verified badge + score */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <VerifiedBadge actionId={result.actionId} />
              <h2 className="mt-1 text-lg font-semibold leading-tight text-foreground">
                {result.analysis.verdict}
              </h2>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {result.analysis.rationale}
              </p>
            </div>
            <ScoreArc score={result.analysis.score} />
          </div>

          {/* Recommendations */}
          {result.analysis.recommendations.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap size={11} className="text-cyan-DEFAULT" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
                  Recommendations
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {result.analysis.recommendations.map((rec, i) => (
                  <li key={i}
                    className="animate-slide-in flex items-start gap-2.5 rounded-lg border border-white/6 bg-black/20 px-3 py-2 text-sm text-foreground"
                    style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cyan-border bg-cyan-dim font-mono text-[9px] font-bold text-cyan-DEFAULT">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Cryptographic proof section ────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Hash size={11} className="text-cyan-DEFAULT" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
                Cryptographic Proof
              </span>
            </div>

            <div className="divide-y divide-white/5 rounded-lg border border-white/8 bg-black/30 font-mono text-[11px]">
              {[
                { label: "TASK HASH",   value: result.taskHash,   copy: true },
                { label: "RESULT HASH", value: result.resultHash, copy: true },
                { label: "ACTION ID",   value: `#${String(result.actionId)}`, copy: false },
                { label: "TX HASH",     value: result.txHash,     copy: true },
              ].map(({ label, value, copy }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-[100px] shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground/60">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground/90">{value}</span>
                  {copy && <CopyButton value={value} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Verify integrity ───────────────────────────────────────── */}
          <VerifyIntegrityPanel
            pitch={pitch}
            resultJson={result.result}
            resultHash={result.resultHash}
            taskHash={result.taskHash}
            actionId={result.actionId}
          />

          {/* ── Explorer link ──────────────────────────────────────────── */}
          <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border border-cyan-border px-4 py-2.5",
              "font-mono text-[12px] font-semibold uppercase tracking-wider text-cyan-DEFAULT",
              "bg-cyan-dim transition-all hover:bg-cyan-dim/40 hover:glow-cyan",
              "animate-glow-cyan",
            )}>
            <ShieldCheck size={13} />
            View Proof of Action on Mezame Explorer
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline step indicator ───────────────────────────────────────────────────

const PIPE_STAGES = [
  { id: "analyzing",  label: "AI",      icon: Sparkles },
  { id: "submitting", label: "Sign",    icon: Wallet   },
  { id: "confirming", label: "Chain",   icon: Database },
  { id: "done",       label: "Done",    icon: ShieldCheck },
] as const;

function PipelineBar({ stage }: { stage: string }) {
  const activeIdx = PIPE_STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="flex items-center gap-0">
      {PIPE_STAGES.map((s, i) => {
        const done = i < activeIdx || stage === "done";
        const active = s.id === stage;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-all duration-500",
              done   && "border-green-500/50 bg-green-500/15 text-green-400",
              active && "border-cyan-border bg-cyan-dim text-cyan-DEFAULT animate-glow-cyan",
              !done && !active && "border-white/10 bg-white/5 text-muted-foreground",
            )}>
              {done ? <CheckCircle2 size={12} /> : <Icon size={12} />}
            </div>
            <span className={cn(
              "ml-1.5 font-mono text-[10px] uppercase tracking-wider",
              done   && "text-green-400",
              active && "text-cyan-DEFAULT",
              !done && !active && "text-muted-foreground/40",
            )}>
              {s.label}
            </span>
            {i < PIPE_STAGES.length - 1 && (
              <div className={cn(
                "mx-1.5 h-px flex-1 transition-all duration-700",
                done ? "bg-green-500/40" : "bg-white/8",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TrustAgentDemo() {
  const { isConnected } = useAccount();
  const { stage, result, error, execute, reset } = useExecuteTrustAgent();
  const [pitch, setPitch] = useState("");
  const busy = stage === "analyzing" || stage === "submitting" || stage === "confirming";
  const done  = stage === "done";

  // Auto-scroll to result
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (done && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [done]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim() || busy) return;
    execute(pitch.trim());
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Input section ──────────────────────────────────────────────────── */}
      {!done && (
        <form onSubmit={handleSubmit}
          className={cn(
            "flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all",
            busy ? "border-cyan-border" : "border-white/10",
          )}>

          {/* Form header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-DEFAULT" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
                Agent Input
              </span>
            </div>
            {!isConnected && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-400">
                <Wallet size={10} />
                Wallet not connected
              </div>
            )}
          </div>

          <textarea
            id="pitch"
            rows={5}
            placeholder="> Describe your startup — problem, solution, and target market…"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            disabled={busy}
            className={cn(
              "w-full resize-none rounded-lg border bg-black/30 px-4 py-3",
              "font-mono text-sm text-foreground placeholder:text-muted-foreground/40",
              "focus:outline-none focus:ring-1 focus:ring-cyan-DEFAULT/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all",
              busy ? "border-cyan-border/40" : "border-white/10",
            )}
            maxLength={4000}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              {pitch.length} / 4 000 chars
            </span>

            <div className="flex gap-2">
              {(stage === "error") && (
                <Button type="button" variant="outline" size="sm" onClick={() => { reset(); }}
                  className="h-8 gap-1.5 border-white/15 font-mono text-[11px]">
                  <RotateCcw size={12} />
                  Reset
                </Button>
              )}
              <Button type="submit"
                disabled={!pitch.trim() || busy}
                className={cn(
                  "h-8 gap-1.5 font-mono text-[12px] uppercase tracking-wider",
                  busy && "border-cyan-border/60 bg-cyan-dim text-cyan-DEFAULT",
                )}>
                {busy ? (
                  <><Loader2 size={12} className="animate-spin" /> Processing…</>
                ) : (
                  <><Sparkles size={12} /> Execute Analysis</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── Pipeline bar ───────────────────────────────────────────────────── */}
      {busy && (
        <div className="animate-fade-up rounded-lg border border-white/8 bg-card px-4 py-3">
          <PipelineBar stage={stage} />
        </div>
      )}

      {/* ── Scanning overlay ────────────────────────────────────────────────── */}
      {busy && <ScanningPanel stage={stage} />}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {stage === "error" && error && (
        <div className="animate-fade-up flex gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3.5 text-sm text-red-400">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Error</span>
            <span className="text-sm text-red-300/80">{error}</span>
          </div>
        </div>
      )}

      {/* ── Result audit log ────────────────────────────────────────────────── */}
      {done && result && (
        <div ref={resultRef}>
          {/* Reset button */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-green-400" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-green-400">
                Pipeline Complete
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { reset(); setPitch(""); }}
              className="h-7 gap-1.5 border-white/15 font-mono text-[11px] hover:border-cyan-DEFAULT/40">
              <RotateCcw size={11} />
              New Analysis
            </Button>
          </div>
          <AuditLogCard result={result} pitch={pitch} />
        </div>
      )}
    </div>
  );
}
