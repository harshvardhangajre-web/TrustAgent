/** Deployed TrustAgent (escrow + reputation) on Shardeum Mezame. */
export const TRUST_AGENT_ADDRESS =
  (process.env.NEXT_PUBLIC_TRUST_AGENT_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";

/** Legacy ActionLog (startup audit) — optional second contract. */
export const ACTION_LOG_ADDRESS =
  (process.env.NEXT_PUBLIC_ACTION_LOG_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
