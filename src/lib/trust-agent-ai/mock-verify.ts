import type { VerifyOutcome } from "./types";

const SUCCESS_HINTS = ["successful", "completed", "delivered", "on time"];
const FAILURE_HINTS = [
  "not show",
  "no-show",
  "noshow",
  "didn't show",
  "did not show",
  "failed",
  "absent",
  "no response",
];

export function analyzeMeetingSummary(summary: string): VerifyOutcome {
  const t = summary.trim().toLowerCase();
  if (!t) return "MANUAL";

  const hitSuccess = SUCCESS_HINTS.some((w) => t.includes(w));
  const hitFail = FAILURE_HINTS.some((w) => t.includes(w));

  if (hitSuccess && hitFail) return "MANUAL";
  if (hitFail) return "FAILURE";
  if (hitSuccess) return "SUCCESS";
  return "MANUAL";
}

export function fakeTxHash(): string {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i++) {
    out += hex[Math.floor(Math.random() * 16)];
  }
  return out;
}

export function outcomeLabel(o: VerifyOutcome): "SUCCESS" | "REFUND" | "REVIEW" {
  if (o === "SUCCESS") return "SUCCESS";
  if (o === "FAILURE") return "REFUND";
  return "REVIEW";
}
