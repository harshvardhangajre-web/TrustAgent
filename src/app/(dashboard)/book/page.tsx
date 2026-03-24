"use client";

import { motion } from "framer-motion";

import { BookingEscrowForm } from "@/components/booking-escrow-form";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="flex flex-col gap-6"
      >
        <motion.div variants={card} className="flex flex-col gap-1">
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-foreground">
            Trust-Calendly
          </h1>
          <p className="text-sm text-muted-foreground">
            High-trust scheduling: your company invites talent, deposits SHM into meeting escrow, and
            the AI auditor verifies outcomes on Shardeum Mezame.
          </p>
        </motion.div>
        <motion.div variants={card}>
          <BookingEscrowForm />
        </motion.div>
      </motion.div>
    </div>
  );
}
