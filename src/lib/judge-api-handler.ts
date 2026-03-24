import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { sha256 } from "@/lib/hash";
import { judgeMeetingSummary } from "@/lib/meeting-judge";
import { OpenAIConfigError } from "@/lib/openai";
import { submitOutcomeOnChain } from "@/lib/oracle-ethers";

function friendlyChainOrLlmError(err: unknown): { message: string; status: number } {
  if (err instanceof OpenAIConfigError) {
    return { message: err.message, status: 503 };
  }
  if (err instanceof OpenAI.APIError) {
    const code = err.status;
    if (code === 401 || code === 403) {
      return {
        message:
          "OpenAI rejected the API key (401/403). Update OPENAI_API_KEY in .env.local with a valid key from https://platform.openai.com/account/api-keys — then restart the dev server.",
        status: 503,
      };
    }
    if (code === 429) {
      return {
        message: "OpenAI rate limit reached. Try again in a minute or check your billing/plan.",
        status: 503,
      };
    }
    return {
      message: err.message?.replace(/sk-[a-zA-Z0-9_-]{8,}/g, "sk-***") ?? "OpenAI request failed.",
      status: 503,
    };
  }
  const msg = err instanceof Error ? err.message : String(err);
  const safe = msg.replace(/sk-[a-zA-Z0-9_-]{8,}/g, "sk-***");
  if (/401|incorrect api key|invalid api key/i.test(safe)) {
    return {
      message:
        "OpenAI authentication failed. Set a valid OPENAI_API_KEY in .env.local and restart `npm run dev`.",
      status: 503,
    };
  }
  return { message: safe, status: 502 };
}

export async function handleJudgePost(req: NextRequest) {
  let body: { bookingId?: number; meetingSummary?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = body.bookingId;
  const meetingSummary =
    typeof body.meetingSummary === "string" ? body.meetingSummary.trim() : "";

  if (typeof bookingId !== "number" || bookingId < 1 || !Number.isInteger(bookingId)) {
    return NextResponse.json({ error: "bookingId must be a positive integer" }, { status: 400 });
  }
  if (!meetingSummary || meetingSummary.length > 8_000) {
    return NextResponse.json({ error: "meetingSummary required (max 8000 chars)" }, { status: 400 });
  }

  try {
    const judgment = await judgeMeetingSummary(meetingSummary);
    const proofOfAction = await sha256(
      "trust-agent:poa:v1",
      String(bookingId),
      judgment.meetingSuccessful ? "payout" : "refund",
      judgment.reason,
      meetingSummary
    );

    const { hash } = await submitOutcomeOnChain(
      BigInt(bookingId),
      judgment.meetingSuccessful,
      judgment.reason
    );

    return NextResponse.json({
      ok: true,
      meetingSuccessful: judgment.meetingSuccessful,
      reason: judgment.reason,
      proofOfAction,
      txHash: hash,
      explorerUrl: `https://explorer-mezame.shardeum.org/transaction/${hash}`,
    });
  } catch (e) {
    const { message, status } = friendlyChainOrLlmError(e);
    const code =
      e instanceof OpenAIConfigError
        ? e.code
        : e instanceof OpenAI.APIError
          ? `openai_${e.status ?? "error"}`
          : "judge_failed";
    return NextResponse.json(
      { error: "Judge / chain failed", details: message, code },
      { status }
    );
  }
}
