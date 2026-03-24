import { defineChain } from "viem";
import { cookieStorage, createConfig, createStorage, http, injected } from "wagmi";

function parseChainId(): number {
  const raw = process.env.NEXT_PUBLIC_CHAIN_ID?.trim();
  if (!raw) return 8119;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 8119;
}

function parseRpcUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SHARDEUM_RPC?.trim();
  return raw && raw.startsWith("http") ? raw : "https://api-mezame.shardeum.org";
}

const rpcUrl = parseRpcUrl();
const chainId = parseChainId();

export const shardeumMezame = defineChain({
  id: chainId,
  name: "Shardeum Mezame",
  nativeCurrency: { name: "Shardeum", symbol: "SHM", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

const storage = createStorage({
  storage: cookieStorage,
});

export const wagmiConfig = createConfig({
  chains: [shardeumMezame],
  connectors: [injected()],
  transports: {
    [shardeumMezame.id]: http(rpcUrl),
  },
  ssr: true,
  storage,
});
