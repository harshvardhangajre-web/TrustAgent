import { Contract, JsonRpcProvider, Wallet } from "ethers";

import { TRUST_AGENT_ABI } from "@/lib/trust-agent-abi";
import { TRUST_AGENT_ADDRESS } from "@/lib/contracts";
import { withRetry } from "@/lib/retry";

const RPC = process.env.NEXT_PUBLIC_SHARDEUM_RPC ?? "https://api-mezame.shardeum.org";

function getOracleKey(): string {
  const k = process.env.ORACLE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!k || k.startsWith("your_")) {
    throw new Error(
      "Set ORACLE_PRIVATE_KEY or PRIVATE_KEY in .env.local (must match on-chain oracle address)."
    );
  }
  return k.startsWith("0x") ? k : `0x${k}`;
}

export function getTrustAgentContract(signer?: Wallet) {
  const provider = new JsonRpcProvider(RPC);
  const wallet = signer ?? new Wallet(getOracleKey(), provider);
  return new Contract(TRUST_AGENT_ADDRESS, TRUST_AGENT_ABI, wallet);
}

/** Submit AI judgment on-chain with RPC retries. */
export async function submitOutcomeOnChain(
  bookingId: bigint,
  meetingSuccessful: boolean,
  reason: string
): Promise<{ hash: string }> {
  if (TRUST_AGENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set NEXT_PUBLIC_TRUST_AGENT_ADDRESS to the deployed TrustAgent contract.");
  }

  const contract = getTrustAgentContract();

  return withRetry(
    async () => {
      const tx = meetingSuccessful
        ? await contract.completeMeeting(bookingId, reason)
        : await contract.executeOutcome(bookingId, false, reason);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("No receipt");
      const ok = receipt.status === 1 || receipt.status === BigInt(1);
      if (!ok) throw new Error("Transaction failed");
      return { hash: receipt.hash };
    },
    {
      label: meetingSuccessful ? "completeMeeting" : "executeOutcome(refund)",
      retries: 5,
      baseDelayMs: 600,
    }
  );
}
