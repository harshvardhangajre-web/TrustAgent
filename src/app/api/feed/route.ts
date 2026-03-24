import { ethers } from "ethers";
import { NextResponse } from "next/server";

import { ACTION_LOG_ABI } from "@/lib/action-log-abi";
import type { FeedEntry } from "@/types";

export const dynamic = "force-dynamic";

const RPC = process.env.NEXT_PUBLIC_SHARDEUM_RPC ?? "https://api-mezame.shardeum.org";
const ADDR = process.env.NEXT_PUBLIC_ACTION_LOG_ADDRESS as string | undefined;

const MAX_LOGS = 30;
const LOOKBACK_BLOCKS = 100_000;

/**
 * GET /api/feed — recent ActionLogged events via Ethers.js v6 (read-only).
 */
export async function GET() {
  if (!ADDR || ADDR === "0x0000000000000000000000000000000000000000") {
    return NextResponse.json({ entries: [] as FeedEntry[], message: "Contract not configured" });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(ADDR, [...ACTION_LOG_ABI], provider);

    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - LOOKBACK_BLOCKS);
    const filter = contract.filters.ActionLogged();
    const logs = await contract.queryFilter(filter, fromBlock, latest);
    const sliced = logs.slice(-MAX_LOGS).reverse();

    const entries: FeedEntry[] = [];

    for (const log of sliced) {
      if (!("args" in log) || !log.args) continue;
      const { actionId, actor, taskHash, result } = log.args as unknown as {
        actionId: bigint;
        actor: string;
        taskHash: string;
        result: string;
      };
      const block =
        log.blockNumber != null ? await provider.getBlock(log.blockNumber) : null;
      const preview =
        result.length > 120 ? `${result.slice(0, 117)}…` : result;
      entries.push({
        actionId: String(actionId),
        actor: actor as `0x${string}`,
        taskHash: taskHash as `0x${string}`,
        resultPreview: preview,
        timestamp: block?.timestamp ?? 0,
        blockNumber: log.blockNumber?.toString(),
        txHash: log.transactionHash as `0x${string}`,
      });
    }

    return NextResponse.json({ entries });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Feed query failed";
    return NextResponse.json({ entries: [] as FeedEntry[], error: msg }, { status: 200 });
  }
}
