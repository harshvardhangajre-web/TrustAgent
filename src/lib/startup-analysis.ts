import { keccak256, toUtf8Bytes } from "ethers";

import { sha256 } from "@/lib/hash";
import { getOpenAIClient, TRUST_AGENT_MODEL } from "@/lib/openai";
import type { AnalyzeResponse, MarketFitAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are a senior venture analyst specialising in startup evaluation.
Your task is to analyse a startup pitch and return a structured Market Fit assessment.

Return ONLY a valid JSON object — no markdown fences, no prose — with this exact shape:
{
  "score": <integer 1–100>,
  "verdict": "<one-line summary, max 12 words>",
  "rationale": "<2–3 sentences explaining the score>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Scoring guide:
  1–25  : Poor fit — unvalidated idea, tiny / unclear market.
 26–50  : Early / uncertain — some signal but major gaps remain.
 51–75  : Promising — clear problem, early traction or strong differentiation.
 76–100 : Strong fit — validated demand, scalable model, defensible moat.`;

export async function analysePitchWithLLM(pitch: string): Promise<MarketFitAnalysis> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: TRUST_AGENT_MODEL,
    temperature: 0.3,
    max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyse the following startup pitch:\n\n${pitch}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("LLM returned an empty response.");

  const parsed = JSON.parse(raw) as Partial<MarketFitAnalysis>;
  const score = Number(parsed.score);
  if (!Number.isInteger(score) || score < 1 || score > 100) {
    throw new Error(`Invalid score from LLM: ${parsed.score}`);
  }
  if (typeof parsed.verdict !== "string" || !parsed.verdict) {
    throw new Error("LLM response missing verdict.");
  }
  if (typeof parsed.rationale !== "string" || !parsed.rationale) {
    throw new Error("LLM response missing rationale.");
  }
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.filter((r): r is string => typeof r === "string")
    : [];

  return { score, verdict: parsed.verdict, rationale: parsed.rationale, recommendations };
}

/** Build API response: task hash (bytes32), canonical result JSON, SHA-256 of result. */
export async function buildAnalyzeResponse(
  pitch: string,
  taskType: string
): Promise<AnalyzeResponse> {
  const analysis = await analysePitchWithLLM(pitch);
  const result = JSON.stringify({
    taskType,
    analysis,
    scoredAt: new Date().toISOString(),
  });
  const resultHash = await sha256(result);
  const taskHash = keccak256(toUtf8Bytes(pitch)) as `0x${string}`;

  return {
    taskType,
    taskHash,
    result,
    resultHash,
    analysis,
    processedAt: new Date().toISOString(),
  };
}
