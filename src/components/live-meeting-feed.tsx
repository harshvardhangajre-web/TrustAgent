"use client";

import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Row = {
  kind: string;
  txHash: string;
  blockNumber?: string;
  bookingId?: string;
  summary: string;
};

const EXPLORER = "https://explorer-mezame.shardeum.org";

export function LiveMeetingFeed({ className }: { className?: string }) {
  const [entries, setEntries] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed-meeting", { cache: "no-store" });
      const data = await res.json();
      setEntries(data.entries ?? []);
      if (data.error) setError(data.error);
    } catch {
      setError("Failed to load");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 14_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-violet-500/30 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-black/25 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={14} className="animate-pulse text-violet-400" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-violet-300">
            Escrow & outcomes
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => load()}
          disabled={loading}
          className="h-7 gap-1 px-2 font-mono text-[10px]"
        >
          <RefreshCw size={11} className={cn(loading && "animate-spin")} />
        </Button>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {loading && entries.length === 0 ? (
          <p className="px-4 py-6 text-center font-mono text-[11px] text-muted-foreground">
            Loading TrustAgent events…
          </p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
            Deploy TrustAgent and set{" "}
            <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_TRUST_AGENT_ADDRESS</code>.
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {entries.map((e) => (
              <li key={`${e.txHash}-${e.kind}-${e.bookingId}`} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "font-mono text-[9px] font-bold uppercase",
                        e.kind === "Booked" ? "text-cyan-400" : "text-green-400"
                      )}
                    >
                      {e.kind}
                    </span>
                    <p className="mt-0.5 text-[11px] leading-snug text-foreground/90">{e.summary}</p>
                  </div>
                  <a
                    href={`${EXPLORER}/tx/${e.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-cyan-400"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="border-t border-white/6 px-3 py-1.5 text-[10px] text-amber-200">{error}</p>
      )}
    </div>
  );
}
