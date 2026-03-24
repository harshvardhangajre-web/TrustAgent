import Link from "next/link";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-6 py-20">

      {/* Radial glows */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(6,182,212,0.12), transparent)" }} />
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99,102,241,0.08), transparent)" }} />

      {/* Animated corner brackets */}
      {[
        "top-8 left-8 border-t border-l",
        "top-8 right-8 border-t border-r",
        "bottom-8 left-8 border-b border-l",
        "bottom-8 right-8 border-b border-r",
      ].map((cls, i) => (
        <div key={i}
          className={`pointer-events-none absolute ${cls} h-8 w-8 border-cyan/30`}
          style={{ filter: "drop-shadow(0 0 4px rgba(6,182,212,0.3))" }} />
      ))}

      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">

        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-cyan-border bg-cyan-dim px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan">
            {siteConfig.problemStatement} · Shardeum Mezame
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            <span
              className="text-cyan"
              style={{ textShadow: "0 0 40px rgba(6,182,212,0.5)" }}>
              Trust
            </span>
            <span>Agent</span>
          </h1>
          <p className="text-balance text-lg text-muted-foreground">
            AI-powered audit intelligence with cryptographic proof.
            Every decision is hashed and immutably recorded on Shardeum.
          </p>
        </div>

        {/* Feature list */}
        <div className="grid w-full max-w-md grid-cols-3 gap-2">
          {[
            { label: "GPT-4o",       sub: "Market Fit AI"   },
            { label: "SHA-256",      sub: "Evidence Hash"   },
            { label: "On-Chain",     sub: "Shardeum Proof"  },
          ].map(({ label, sub }) => (
            <div key={label}
              className="flex flex-col items-center gap-0.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2.5">
              <span className="font-mono text-xs font-bold text-cyan">{label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{sub}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/trust-agent-ai"
            className="rounded-lg border border-cyan/40 bg-cyan-dim px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-widest text-cyan transition-all hover:glow-cyan"
          >
            TrustAgent AI (no setup)
          </Link>
          <ConnectWalletButton />
          <Link href="/dashboard"
            className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Open Dashboard →
          </Link>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground/60">
          Chain ID: 8119 · {" "}
          <a href="https://explorer-mezame.shardeum.org" target="_blank" rel="noopener noreferrer"
            className="hover:text-cyan transition-colors underline underline-offset-2">
            explorer-mezame.shardeum.org
          </a>
        </p>
      </div>
    </main>
  );
}
