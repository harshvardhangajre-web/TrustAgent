import { defineChain } from "viem";
import { createConfig, http, injected } from "wagmi";

const rpcUrl =
  process.env.NEXT_PUBLIC_SHARDEUM_RPC ?? "https://api-mezame.shardeum.org";
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 8119);

export const shardeumMezame = defineChain({
  id: chainId,
  name: "Shardeum Mezame",
  nativeCurrency: { name: "Shardeum", symbol: "SHM", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

export const wagmiConfig = createConfig({
  chains: [shardeumMezame],
  connectors: [injected()],
  transports: {
    [shardeumMezame.id]: http(rpcUrl),
  },
  ssr: true,
});
