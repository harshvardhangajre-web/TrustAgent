import { ethers } from "ethers";
import { NextResponse } from "next/server";

import { TRUST_AGENT_ABI } from "@/lib/trust-agent-abi";
import { TRUST_AGENT_ADDRESS } from "@/lib/contracts";

export const dynamic = "force-dynamic";

const RPC = process.env.NEXT_PUBLIC_SHARDEUM_RPC ?? "https://api-mezame.shardeum.org";
const LOOKBACK = 150_000n;

export interface MeetingFeedRow {
  kind: "Booked" | "OutcomeSettled";
  txHash: string;
  blockNumber?: string;
  bookingId?: string;
  summary: string;
}

/**
 * Recent TrustAgent escrow events (Booked / OutcomeSettled) for the live column.
 */
export async function GET() {
  if (TRUST_AGENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return NextResponse.json({ entries: [] as MeetingFeedRow[] });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(TRUST_AGENT_ADDRESS, TRUST_AGENT_ABI, provider);
    const latest = await provider.getBlockNumber();
    const from = latest - Number(LOOKBACK);

    const booked = await contract.queryFilter(contract.filters.Booked(), from, latest);
    const outcomes = await contract.queryFilter(
      contract.filters.OutcomeSettled(),
      from,
      latest
    );

    const rows: MeetingFeedRow[] = [];

    for (const log of booked.slice(-15)) {
      if (!("args" in log) || !log.args) continue;
      const a = log.args as unknown as {
        bookingId: bigint;
        company: string;
        employee: string;
        amount: bigint;
        meetingEnd: bigint;
      };
      rows.push({
        kind: "Booked",
        txHash: log.transactionHash,
        blockNumber: log.blockNumber?.toString(),
        bookingId: String(a.bookingId),
        summary: `Booked #${a.bookingId} · ${a.amount.toString()} wei → employee ${a.employee.slice(0, 8)}…`,
      });
    }

    for (const log of outcomes.slice(-15)) {
      if (!("args" in log) || !log.args) continue;
      const a = log.args as unknown as {
        bookingId: bigint;
        meetingSuccessful: boolean;
        beneficiary: string;
        amount: bigint;
        reason: string;
      };
      rows.push({
        kind: "OutcomeSettled",
        txHash: log.transactionHash,
        blockNumber: log.blockNumber?.toString(),
        bookingId: String(a.bookingId),
        summary: `${a.meetingSuccessful ? "Paid" : "Refund"} #${a.bookingId} — ${a.reason?.slice(0, 80) ?? ""}`,
      });
    }

    rows.sort((x, y) => (x.blockNumber && y.blockNumber ? Number(y.blockNumber) - Number(x.blockNumber) : 0));

    return NextResponse.json({ entries: rows.slice(0, 25) });
  } catch (e) {
    return NextResponse.json({
      entries: [] as MeetingFeedRow[],
      error: e instanceof Error ? e.message : "feed error",
    });
  }
}
