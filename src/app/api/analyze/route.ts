import { NextRequest, NextResponse } from "next/server";

import { buildAnalyzeResponse } from "@/lib/startup-analysis";
import type { AnalyzeError, AnalyzeRequest } from "@/types";

function validateBody(body: unknown): AnalyzeRequest {
  if (!body || typeof body !== "object") {
    throw new TypeError("Request body must be a JSON object.");
  }
  const { pitch, taskType } = body as Record<string, unknown>;

  if (typeof pitch !== "string" || pitch.trim().length === 0) {
    throw new TypeError('Field "pitch" must be a non-empty string.');
  }
  if (pitch.length > 4_000) {
    throw new RangeError('"pitch" must be ≤ 4 000 characters.');
  }
  if (taskType !== undefined && typeof taskType !== "string") {
    throw new TypeError('"taskType" must be a string when provided.');
  }

  return { pitch: pitch.trim(), taskType: taskType?.trim() || "market_fit" };
}

/**
 * POST /api/analyze — LLM startup score + SHA-256 hash of the canonical result JSON.
 */
export async function POST(req: NextRequest) {
  let input: AnalyzeRequest;
  try {
    const body: unknown = await req.json();
    input = validateBody(body);
  } catch (err) {
    return NextResponse.json<AnalyzeError>(
      { error: "Invalid request", details: (err as Error).message },
      { status: 400 }
    );
  }

  try {
    const response = await buildAnalyzeResponse(input.pitch, input.taskType ?? "market_fit");
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const msg = (err as Error).message ?? "Unknown error";
    const isApiKey = msg.includes("OPENAI_API_KEY");
    return NextResponse.json<AnalyzeError>(
      { error: isApiKey ? "Server misconfiguration" : "Analysis failed", details: msg },
      { status: isApiKey ? 500 : 502 }
    );
  }
}
