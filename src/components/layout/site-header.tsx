import Link from "next/link";

import { ConnectWalletButton } from "@/components/connect-wallet-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Animated shield icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
            className="text-cyan-DEFAULT transition-all group-hover:drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]"
            style={{ filter: "drop-shadow(0 0 4px rgba(6,182,212,0.5))" }}>
            <path d="M9 1L2 4v5c0 4.418 3.134 7.843 7 8.5C12.866 16.843 16 13.418 16 9V4L9 1Z"
              stroke="currentColor" strokeWidth="1.4" fill="rgba(6,182,212,0.1)" />
            <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">
            Trust<span className="text-cyan-DEFAULT" style={{ textShadow: "0 0 10px rgba(6,182,212,0.6)" }}>Agent</span>
          </span>
        </Link>

        {/* Nav + wallet */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard"
            className="hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline">
            Dashboard
          </Link>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
