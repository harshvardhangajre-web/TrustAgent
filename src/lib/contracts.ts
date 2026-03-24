/** Deployed ActionLog on Shardeum Mezame (set in .env.local). */
export const ACTION_LOG_ADDRESS =
  (process.env.NEXT_PUBLIC_ACTION_LOG_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
