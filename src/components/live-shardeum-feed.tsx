"use client";

import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { FeedEntry } from "@/types";
import { cn } from "@/lib/utils";

const EXPLORER = "https://explorer-mezame.shardeum.org";

export function LiveShardeumFeed({ className }: { className?: string }) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed", { cache: "no-store" });
      const data = await res.json();
      if (data.error && !data.entries?.length) {
        setError(data.error);
      }
      setEntries(data.entries ?? []);
      setUpdatedAt(new Date());
    } catch {
      setError("Failed to load feed");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 12_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-cyan-border/50 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-black/25 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={14} className="animate-pulse text-cyan-DEFAULT" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
            Live Shardeum Feed
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => load()}
          disabled={loading}
          className="h-7 gap-1 px-2 font-mono text-[10px] text-muted-foreground"
        >
          <RefreshCw size={11} className={cn(loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {error && (
          <p className="border-b border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
            {error}
          </p>
        )}
        {loading && entries.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-[11px] text-muted-foreground">
            Pulling ActionLogged events…
          </p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12px] text-muted-foreground">
            No events yet. Deploy ActionLog, set{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">
              NEXT_PUBLIC_ACTION_LOG_ADDRESS
            </code>
            , and submit a pitch.
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {entries.map((e) => (
              <li key={`${e.txHash}-${e.actionId}`} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-green-400">
                        #{e.actionId}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {e.timestamp
                          ? new Date(e.timestamp * 1000).toISOString().slice(11, 19)
                          : "—"}{" "}
                        UTC
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
                      <span className="text-cyan-DEFAULT/80">task</span>{" "}
                      {e.taskHash.slice(0, 10)}…{e.taskHash.slice(-8)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-foreground/85">
                      {e.resultPreview}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground/80">
                      {e.actor.slice(0, 8)}…{e.actor.slice(-6)}
                    </p>
                  </div>
                  {e.txHash && (
                    <a
                      href={`${EXPLORER}/transaction/${e.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded border border-white/10 p-1.5 text-muted-foreground transition-colors hover:border-cyan-border hover:text-cyan-DEFAULT"
                      aria-label="View transaction"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {updatedAt && (
        <div className="border-t border-white/6 px-3 py-2 text-center font-mono text-[9px] text-muted-foreground">
          Last sync {updatedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
