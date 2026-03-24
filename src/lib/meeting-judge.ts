import { getOpenAIClient, TRUST_AGENT_MODEL } from "@/lib/openai";

const JUDGE_PROMPT = `You are the Trust-Agent AI auditor for Shardeum Mezame.
Given a meeting summary (or notes), decide if the meeting was successfully completed from the company's perspective
(employee showed up, value was delivered, or the session occurred as booked).

Return ONLY valid JSON:
{
  "meetingSuccessful": <boolean>,
  "reason": "<one short sentence for the on-chain record>"
}

Rules:
- If the text clearly says the employee did not show, no-show, cancelled, ghosted, or zero attendance → meetingSuccessful: false.
- If the meeting ran, demo happened, or success keywords → meetingSuccessful: true.
- When ambiguous, prefer false (protect company escrow).`;

export interface MeetingJudgment {
  meetingSuccessful: boolean;
  reason: string;
}

export async function judgeMeetingSummary(meetingSummary: string): Promise<MeetingJudgment> {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: TRUST_AGENT_MODEL,
    temperature: 0.1,
    max_tokens: 256,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: JUDGE_PROMPT },
      { role: "user", content: `Meeting summary / notes:\n\n${meetingSummary}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("LLM returned empty judgment.");

  const parsed = JSON.parse(raw) as Partial<MeetingJudgment>;
  if (typeof parsed.meetingSuccessful !== "boolean") {
    throw new Error("Invalid judgment JSON.");
  }
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim().slice(0, 500)
      : parsed.meetingSuccessful
        ? "Meeting completed successfully."
        : "Meeting unsuccessful or incomplete.";

  return { meetingSuccessful: parsed.meetingSuccessful, reason };
}
