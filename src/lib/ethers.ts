import { JsonRpcProvider } from "ethers";

const rpcUrl =
  process.env.NEXT_PUBLIC_SHARDEUM_RPC ?? "https://api-mezame.shardeum.org";

/** Read-only provider for Shardeum (server or client with public RPC). */
export function getJsonRpcProvider() {
  return new JsonRpcProvider(rpcUrl);
}
