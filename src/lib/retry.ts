/**
 * Retry async work with exponential backoff — useful for flaky Shardeum RPC.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    baseDelayMs?: number;
    label?: string;
  } = {}
): Promise<T> {
  const retries = options.retries ?? 4;
  const base = options.baseDelayMs ?? 400;
  const label = options.label ?? "operation";

  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (attempt === retries) break;
      const delay = base * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last instanceof Error ? last : new Error(`${label} failed after ${retries + 1} attempts`);
}
