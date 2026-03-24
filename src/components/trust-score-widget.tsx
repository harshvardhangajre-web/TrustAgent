"use client";

import { Award } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";

import { TRUST_AGENT_ABI } from "@/lib/trust-agent-abi";
import { TRUST_AGENT_ADDRESS } from "@/lib/contracts";

export function TrustScoreWidget() {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadContract({
    address: TRUST_AGENT_ADDRESS,
    abi: TRUST_AGENT_ABI as never,
    functionName: "reputation",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && TRUST_AGENT_ADDRESS !== "0x0000000000000000000000000000000000000000" },
  });

  if (!isConnected) return null;

  const score = data != null ? Number(data) : 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <Award className="size-5 text-amber-400" />
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          On-chain Trust Score
        </span>
        <span className="font-mono text-xl font-bold text-amber-300">
          {isLoading ? "…" : score}
        </span>
        <span className="text-[10px] text-muted-foreground">Verifiable resume (Shardeum)</span>
      </div>
    </div>
  );
}
