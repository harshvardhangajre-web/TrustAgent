import { Activity, ExternalLink, Link2, Shield } from "lucide-react";
import Link from "next/link";

import { DashboardContent } from "@/components/dashboard-content";

export const metadata = {
  title: "Trust-Agent Command · Shardeum Mezame",
};

const TRUST = process.env.NEXT_PUBLIC_TRUST_AGENT_ADDRESS ?? "0x0000…0000";
const ACTION = process.env.NEXT_PUBLIC_ACTION_LOG_ADDRESS ?? "—";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "8119";
const EXPLORER_BASE = "https://explorer-mezame.shardeum.org";

function StatPill({
  label,
  value,
  href,
  dot,
}: {
  label: string;
  value: string;
  href?: string;
  dot?: "green" | "cyan";
}) {
  const inner = (
    <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2 transition-colors hover:border-white/15">
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dot === "green"
              ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.7)]"
              : "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.7)]"
          }`}
        />
      )}
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[11px] font-medium text-foreground">{value}</span>
      {href && <ExternalLink size={9} className="text-muted-foreground" />}
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function DashboardPage() {
  const shortT =
    TRUST.length > 12 ? `${TRUST.slice(0, 6)}…${TRUST.slice(-4)}` : TRUST;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Shield
                size={16}
                className="text-cyan-400"
                style={{ filter: "drop-shadow(0 0 6px rgba(6,182,212,0.7))" }}
              />
              <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-foreground">
                Trust-Agent
              </h1>
              <span className="font-mono text-[10px] text-muted-foreground">
                {"// PS2 · Mezame"}
              </span>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Escrow bookings, AI auditor, on-chain Trust Score — plus startup audit logging.
              Use{" "}
              <Link href="/book" className="text-cyan-400 underline underline-offset-2">
                /book
              </Link>{" "}
              for Calendly+ flow.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-400">
              Production build
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatPill label="Network" value="Shardeum Mezame" dot="green" />
          <StatPill label="Chain ID" value={CHAIN_ID} dot="cyan" />
          <StatPill
            label="TrustAgent"
            value={shortT}
            href={TRUST.startsWith("0x") ? `${EXPLORER_BASE}/address/${TRUST}` : undefined}
          />
          <StatPill label="ActionLog" value={ACTION.length > 14 ? `${ACTION.slice(0, 6)}…` : ACTION} />
          <a
            href={EXPLORER_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
          >
            <Link2 size={10} />
            Explorer
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 via-white/8 to-transparent" />
          <Activity size={12} className="text-cyan-400/60" />
          <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/30 via-white/8 to-transparent" />
        </div>
      </div>

      <DashboardContent />
    </div>
  );
}
