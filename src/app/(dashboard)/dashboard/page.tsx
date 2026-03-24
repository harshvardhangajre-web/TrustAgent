import { Activity, ExternalLink, Link2, Shield } from "lucide-react";

import { AgentsSection } from "@/components/agents-section";
import { LiveShardeumFeed } from "@/components/live-shardeum-feed";
import { TrustAgentDemo } from "@/components/trust-agent-demo";

export const metadata = { title: "Startup Audit · Trust-Agent" };

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_ACTION_LOG_ADDRESS ?? "0x0000…0000";
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
  const shortAddr =
    CONTRACT_ADDR.length > 12
      ? `${CONTRACT_ADDR.slice(0, 6)}…${CONTRACT_ADDR.slice(-4)}`
      : CONTRACT_ADDR;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Shield
                size={16}
                className="text-cyan-DEFAULT"
                style={{ filter: "drop-shadow(0 0 6px rgba(6,182,212,0.7))" }}
              />
              <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-foreground">
                Startup Audit
              </h1>
              <span className="font-mono text-[10px] text-muted-foreground">
                {"// Trust-Agent"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect a wallet, submit a pitch.{" "}
              <code className="rounded bg-white/10 px-1 font-mono text-[11px]">/api/analyze</code>{" "}
              scores it and returns a SHA-256 of the result; you log{" "}
              <code className="rounded bg-white/10 px-1 font-mono text-[11px]">taskHash</code> +{" "}
              <code className="rounded bg-white/10 px-1 font-mono text-[11px]">result</code> on
              Shardeum Mezame.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-400">
              Live
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatPill label="Network" value="Shardeum Mezame" dot="green" />
          <StatPill label="Chain ID" value={CHAIN_ID} dot="cyan" />
          <StatPill
            label="Contract"
            value={shortAddr}
            href={`${EXPLORER_BASE}/address/${CONTRACT_ADDR}`}
          />
          <StatPill label="Analyze API" value="/api/analyze" dot="cyan" />
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
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-DEFAULT/30 via-white/8 to-transparent" />
          <Activity size={12} className="text-cyan-DEFAULT/60" />
          <div className="h-px flex-1 bg-gradient-to-l from-cyan-DEFAULT/30 via-white/8 to-transparent" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <TrustAgentDemo />
          <AgentsSection />
        </div>
        <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <LiveShardeumFeed />
        </aside>
      </div>
    </div>
  );
}
