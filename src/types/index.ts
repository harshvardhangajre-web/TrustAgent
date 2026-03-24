/** Shared types for the Trust-Agent dashboard (Problem Statement 2). */

export type AgentStatus = "idle" | "running" | "paused" | "error";

export interface TrustAgentSession {
  id: string;
  status: AgentStatus;
  updatedAt: string;
}

/** Detailed market-fit breakdown returned by the LLM. */
export interface MarketFitAnalysis {
  score: number;
  verdict: string;
  rationale: string;
  recommendations: string[];
}

/** POST body for /api/analyze and /api/process-task */
export interface AnalyzeRequest {
  pitch: string;
  taskType?: string;
}

/** Successful response from /api/analyze */
export interface AnalyzeResponse {
  taskType: string;
  /** keccak256(utf8(pitch)) — stored on-chain as taskHash. */
  taskHash: `0x${string}`;
  /** Canonical JSON payload logged on-chain (includes analysis). */
  result: string;
  /** SHA-256 hex digest of `result` (integrity reference; compare off-chain). */
  resultHash: string;
  analysis: MarketFitAnalysis;
  processedAt: string;
}

export interface AnalyzeError {
  error: string;
  details?: string;
}

/** Legacy alias */
export type ProcessTaskRequest = AnalyzeRequest;
export type ProcessTaskResponse = AnalyzeResponse;
export type ProcessTaskError = AnalyzeError;

/** One row in the live Shardeum feed. */
export interface FeedEntry {
  actionId: string;
  actor: `0x${string}`;
  taskHash: `0x${string}`;
  resultPreview: string;
  timestamp: number;
  blockNumber?: string;
  txHash?: `0x${string}`;
}

/**
 * Stages of a Trust-Agent execution cycle.
 */
export type TrustAgentStage =
  | "idle"
  | "analyzing"
  | "submitting"
  | "confirming"
  | "done"
  | "error";

/** Result after AI + on-chain log. */
export interface TrustAgentResult {
  analysis: MarketFitAnalysis;
  taskHash: `0x${string}`;
  result: string;
  resultHash: string;
  actionId: bigint;
  txHash: `0x${string}`;
  explorerUrl: string;
}
