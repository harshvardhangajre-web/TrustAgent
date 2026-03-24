import type { LucideIcon } from "lucide-react";
import {
  Bot,
  FileSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export interface TrustAgentDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** How this agent is used in Trust-Agent / Shardeum flows */
  integration: string;
  status: "active" | "planned" | "beta";
}

/**
 * Registry of agents wired (or planned) in this project.
 * Dashboard renders this for the “Agents” section.
 */
export const TRUST_AGENTS: TrustAgentDefinition[] = [
  {
    id: "market-fit",
    name: "Market Fit Analyst",
    description:
      "Scores startup pitches 1–100 with verdict, rationale, and recommendations via GPT-4o.",
    icon: TrendingUp,
    integration: "POST /api/analyze → ActionLog.logAction on Shardeum Mezame",
    status: "active",
  },
  {
    id: "integrity",
    name: "Integrity Sentinel",
    description:
      "Re-computes SHA-256 of the logged result JSON and cross-checks on-chain taskHash + payload.",
    icon: ShieldCheck,
    integration: "Client verify + readContract(actions[id])",
    status: "active",
  },
  {
    id: "feed-indexer",
    name: "Mezame Feed Indexer",
    description:
      "Surfaces recent ActionLogged events for a live audit trail in the dashboard.",
    icon: Sparkles,
    integration: "GET /api/feed (Ethers.js v6 JsonRpcProvider)",
    status: "active",
  },
  {
    id: "compliance",
    name: "Compliance Draft (planned)",
    description: "Policy-aware red-flag detection for regulated verticals.",
    icon: Scale,
    integration: "Future: dedicated route + separate taskType",
    status: "planned",
  },
  {
    id: "document",
    name: "Document Extractor (planned)",
    description: "Pitch decks → structured fields before scoring.",
    icon: FileSearch,
    integration: "Future: upload pipeline + IPFS hash as taskHash variant",
    status: "planned",
  },
  {
    id: "orchestrator",
    name: "Agent Orchestrator (beta)",
    description: "Coordinates multi-step workflows across agents with shared evidence hashes.",
    icon: Bot,
    integration: "hooks/use-execute-trust-agent + extensible taskType",
    status: "beta",
  },
];
