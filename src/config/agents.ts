import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Calendar,
  FileSearch,
  Gavel,
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
  integration: string;
  status: "active" | "planned" | "beta";
}

export const TRUST_AGENTS: TrustAgentDefinition[] = [
  {
    id: "escrow-book",
    name: "Calendly+ Escrow",
    description: "Company deposits SHM; TrustAgent.sol holds funds until AI oracle or timeout refund.",
    icon: Calendar,
    integration: "book() · Module A at /book",
    status: "active",
  },
  {
    id: "ai-judge",
    name: "AI Auditor",
    description: "LLM reads meeting notes; backend wallet calls executeOutcome → payout or refund.",
    icon: Gavel,
    integration: "POST /api/judge · Ethers v6 + retry",
    status: "active",
  },
  {
    id: "reputation",
    name: "Trust Score Registry",
    description: "Successful outcomes increase reputation[user] — verifiable resume on Shardeum.",
    icon: ShieldCheck,
    integration: "TrustAgent.reputation(address) · increaseReputation on success path",
    status: "active",
  },
  {
    id: "market-fit",
    name: "Startup Analyst",
    description: "GPT-4o scores pitches; hashes logged via legacy ActionLog for audit trail.",
    icon: TrendingUp,
    integration: "POST /api/analyze",
    status: "active",
  },
  {
    id: "feed-indexer",
    name: "Live Feeds",
    description: "ActionLog + TrustAgent events surfaced for judges and demos.",
    icon: Sparkles,
    integration: "GET /api/feed · /api/feed-meeting",
    status: "active",
  },
  {
    id: "compliance",
    name: "Compliance Draft",
    description: "Policy-aware review for regulated industries.",
    icon: Scale,
    integration: "Planned",
    status: "planned",
  },
  {
    id: "document",
    name: "Document Extractor",
    description: "Decks → structured fields before scoring.",
    icon: FileSearch,
    integration: "Planned",
    status: "planned",
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    description: "Multi-step flows across agents with shared evidence.",
    icon: Bot,
    integration: "hooks + task types",
    status: "beta",
  },
];
