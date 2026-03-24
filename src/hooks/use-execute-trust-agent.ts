"use client";

import { useCallback, useRef, useState } from "react";
import { decodeEventLog } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { ACTION_LOG_ABI } from "@/lib/action-log-abi";
import { ACTION_LOG_ADDRESS } from "@/lib/contracts";
import type {
  AnalyzeError,
  AnalyzeResponse,
  TrustAgentResult,
  TrustAgentStage,
} from "@/types";

const EXPLORER_BASE = "https://explorer-mezame.shardeum.org";

export interface UseExecuteTrustAgentReturn {
  stage: TrustAgentStage;
  stageLabel: string;
  result: TrustAgentResult | null;
  error: string | null;
  execute: (pitch: string, taskType?: string) => Promise<void>;
  reset: () => void;
}

const STAGE_LABELS: Record<TrustAgentStage, string> = {
  idle:       "Ready",
  analyzing:  "Analysing pitch (LLM)…",
  submitting: "Waiting for wallet signature…",
  confirming: "Confirming on Shardeum…",
  done:       "Logged on-chain",
  error:      "Something went wrong",
};

/**
 * 1. POST /api/analyze — LLM score + taskHash + result JSON + resultHash
 * 2. ActionLog.logAction(taskHash, result) on Mezame
 * 3. Parse ActionLogged → actionId, explorer URL
 */
export function useExecuteTrustAgent(): UseExecuteTrustAgentReturn {
  const [stage, setStage] = useState<TrustAgentStage>("idle");
  const [result, setResult] = useState<TrustAgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const abortRef = useRef(false);

  async function fetchAnalyze(pitch: string, taskType: string): Promise<AnalyzeResponse> {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitch, taskType }),
    });
    const data: AnalyzeResponse | AnalyzeError = await res.json();
    if (!res.ok) {
      const err = data as AnalyzeError;
      throw new Error(err.details ?? err.error ?? "Analysis failed");
    }
    return data as AnalyzeResponse;
  }

  const execute = useCallback(
    async (pitch: string, taskType = "market_fit") => {
      abortRef.current = false;
      setError(null);
      setResult(null);

      try {
        setStage("analyzing");
        const payload = await fetchAnalyze(pitch, taskType);
        if (abortRef.current) return;

        setStage("submitting");
        const { txHash, actionId } = await (async () => {
          if (!walletClient) throw new Error("Wallet not connected — please connect first.");

          const hash = await walletClient.writeContract({
            address: ACTION_LOG_ADDRESS,
            abi: ACTION_LOG_ABI,
            functionName: "logAction",
            args: [payload.taskHash as `0x${string}`, payload.result],
          });

          if (abortRef.current) return { txHash: hash, actionId: 0n };

          setStage("confirming");
          if (!publicClient) throw new Error("Public client unavailable.");

          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
          });

          if (receipt.status !== "success") {
            throw new Error(`Transaction reverted — hash: ${hash}`);
          }

          let resolvedActionId = 0n;
          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: ACTION_LOG_ABI,
                eventName: "ActionLogged",
                data: log.data,
                topics: log.topics,
              });
              resolvedActionId = decoded.args.actionId as bigint;
              break;
            } catch {
              /* not our event */
            }
          }

          return { txHash: hash, actionId: resolvedActionId };
        })();

        if (abortRef.current) return;

        setResult({
          analysis: payload.analysis,
          taskHash: payload.taskHash,
          result: payload.result,
          resultHash: payload.resultHash,
          actionId,
          txHash,
          explorerUrl: `${EXPLORER_BASE}/transaction/${txHash}`,
        });
        setStage("done");
      } catch (err) {
        if (abortRef.current) return;
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        setStage("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletClient, publicClient]
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    setStage("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    stage,
    stageLabel: STAGE_LABELS[stage],
    result,
    error,
    execute,
    reset,
  };
}
