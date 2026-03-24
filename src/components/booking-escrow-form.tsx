"use client";

import { format } from "date-fns";
import { CalendarClock, Wallet } from "lucide-react";
import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { Button } from "@/components/ui/button";
import { TRUST_AGENT_ABI } from "@/lib/trust-agent-abi";
import { TRUST_AGENT_ADDRESS } from "@/lib/contracts";

export function BookingEscrowForm() {
  const { isConnected, address } = useAccount();
  const [employee, setEmployee] = useState("");
  const [meetingLocal, setMeetingLocal] = useState(""); // datetime-local string
  const [amountShm, setAmountShm] = useState("0.01");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeErr } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!employee.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Enter a valid employee wallet (0x…).");
      return;
    }
    if (employee.toLowerCase() === address?.toLowerCase()) {
      setError("Employee must be a different wallet than yours.");
      return;
    }
    if (!meetingLocal) {
      setError("Pick a meeting end time.");
      return;
    }
    const endSec = Math.floor(new Date(meetingLocal).getTime() / 1000);
    if (endSec <= Date.now() / 1000 + 60) {
      setError("Meeting end must be at least ~1 minute in the future.");
      return;
    }
    let value: bigint;
    try {
      value = parseEther(amountShm || "0");
    } catch {
      setError("Invalid SHM amount.");
      return;
    }
    if (value === 0n) {
      setError("Deposit must be > 0 SHM.");
      return;
    }

    writeContract({
      address: TRUST_AGENT_ADDRESS,
      abi: TRUST_AGENT_ABI as never,
      functionName: "createMeeting",
      args: [employee as `0x${string}`, BigInt(endSec)],
      value,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <CalendarClock className="size-4 text-cyan-400" />
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-cyan-400">
          Trust-Calendly · Meeting escrow
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Company invites an employee and locks native SHM via{" "}
        <code className="rounded bg-white/10 px-1">createMeeting</code>. After the call, the AI
        auditor settles on-chain — success runs <code className="rounded bg-white/10 px-1">completeMeeting</code>{" "}
        / payout; expiry path uses <code className="rounded bg-white/10 px-1">requestRefund</code>.
      </p>

      {!isConnected && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <Wallet size={14} />
          Connect your company wallet to deposit.
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Employee wallet</span>
        <input
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          placeholder="0x…"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Meeting end (local time)</span>
        <input
          type="datetime-local"
          value={meetingLocal}
          onChange={(e) => setMeetingLocal(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
        />
        {meetingLocal && (
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(meetingLocal), "PPpp")} · unix end{" "}
            {Math.floor(new Date(meetingLocal).getTime() / 1000)}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Deposit (SHM)</span>
        <input
          value={amountShm}
          onChange={(e) => setAmountShm(e.target.value)}
          placeholder="0.05"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
        />
      </label>

      {(error || writeErr) && (
        <p className="text-sm text-red-400">
          {error ?? writeErr?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={!isConnected || isPending || confirming}
        className="gap-2"
      >
        {isPending || confirming ? "Confirm in wallet…" : "Deposit & create booking"}
      </Button>

      {isSuccess && hash && (
        <p className="font-mono text-[11px] text-green-400">
          Booked ·{" "}
          <a
            className="underline"
            href={`https://explorer-mezame.shardeum.org/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            {hash.slice(0, 10)}…
          </a>
        </p>
      )}
    </form>
  );
}
