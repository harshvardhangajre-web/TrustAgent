import type { DemoState } from "./types";

import { getSeedState } from "./seed";

const STORAGE_KEY = "trust-agent-ai-demo-v1";

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return getSeedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed?.bookings || !Array.isArray(parsed.bookings)) return getSeedState();
    return parsed;
  } catch {
    return getSeedState();
  }
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

export function resetDemoState(): DemoState {
  const fresh = getSeedState();
  saveDemoState(fresh);
  return fresh;
}
