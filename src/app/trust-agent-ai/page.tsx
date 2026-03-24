import type { Metadata } from "next";

import { TrustAgentAIDemo } from "@/components/trust-agent-ai/trust-agent-ai-demo";

export const metadata: Metadata = {
  title: "TrustAgent AI — Mock Demo",
  description:
    "Simulated AI escrow for startup task verification. No API keys or blockchain required.",
};

export default function TrustAgentAIPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <TrustAgentAIDemo />
    </main>
  );
}
