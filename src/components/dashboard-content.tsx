"use client";

import { motion } from "framer-motion";

import { AgentsSection } from "@/components/agents-section";
import { JudgeMeetingPanel } from "@/components/judge-meeting-panel";
import { LiveMeetingFeed } from "@/components/live-meeting-feed";
import { LiveShardeumFeed } from "@/components/live-shardeum-feed";
import { TrustAgentDemo } from "@/components/trust-agent-demo";
import { TrustScoreWidget } from "@/components/trust-score-widget";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const } },
};

export function DashboardContent() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="flex min-w-0 flex-col gap-8">
        <motion.div variants={item}>
          <TrustScoreWidget />
        </motion.div>
        <motion.div variants={item}>
          <JudgeMeetingPanel />
        </motion.div>
        <motion.div variants={item}>
          <TrustAgentDemo />
        </motion.div>
        <motion.div variants={item}>
          <AgentsSection />
        </motion.div>
      </div>

      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <motion.div variants={item}>
          <LiveMeetingFeed />
        </motion.div>
        <motion.div variants={item}>
          <LiveShardeumFeed />
        </motion.div>
      </aside>
    </motion.div>
  );
}
