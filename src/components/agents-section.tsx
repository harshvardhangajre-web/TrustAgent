import { TRUST_AGENTS } from "@/config/agents";
import { cn } from "@/lib/utils";

export function AgentsSection() {
  return (
    <section className="rounded-xl border border-white/10 bg-card/80 p-5">
      <h2 className="mb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-DEFAULT">
        Agents in this build
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Each agent covers a slice of the Trust-Agent stack — from LLM scoring to on-chain
        attestation and feed indexing.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TRUST_AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <li
              key={a.id}
              className="flex gap-3 rounded-lg border border-white/8 bg-black/20 p-3 transition-colors hover:border-cyan-border/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-border/30 bg-cyan-dim">
                <Icon size={16} className="text-cyan-DEFAULT" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{a.name}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                      a.status === "active" && "bg-green-500/15 text-green-400",
                      a.status === "beta" && "bg-amber-500/15 text-amber-400",
                      a.status === "planned" && "bg-white/10 text-muted-foreground"
                    )}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                  {a.description}
                </p>
                <p className="mt-2 font-mono text-[10px] text-cyan-DEFAULT/90">
                  {a.integration}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
