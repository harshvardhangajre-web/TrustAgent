"use client";

import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/button";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];

  if (isConnected && address) {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => disconnect()}
      >
        <Wallet className="opacity-80" aria-hidden />
        {shortenAddress(address)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        size="lg"
        disabled={isPending || !injected}
        onClick={() => injected && connect({ connector: injected })}
      >
        <Wallet className="opacity-90" aria-hidden />
        {isPending ? "Connecting…" : "Connect Wallet"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="status">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
