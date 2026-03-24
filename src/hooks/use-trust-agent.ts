"use client";

import { useMemo } from "react";

import type { TrustAgentSession } from "@/types";

/** Placeholder hook for future agent state (dashboard). */
export function useTrustAgent(): TrustAgentSession | null {
  return useMemo(() => null, []);
}
