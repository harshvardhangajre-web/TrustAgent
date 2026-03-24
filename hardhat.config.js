import dotenv from "dotenv";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

dotenv.config({ path: ".env.local" });
dotenv.config();
import { defineConfig } from "hardhat/config";

const RPC_URL = process.env.NEXT_PUBLIC_SHARDEUM_RPC || "https://api-mezame.shardeum.org";
const pk = process.env.PRIVATE_KEY?.trim() || "";
const looksLikeHexKey =
  /^0x[a-fA-F0-9]{64}$/.test(pk) || /^[a-fA-F0-9]{64}$/.test(pk);
const accounts = looksLikeHexKey
  ? [pk.startsWith("0x") ? pk : `0x${pk}`]
  : [];

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    mezame: {
      type: "http",
      chainType: "generic",
      url: RPC_URL,
      chainId: 8119,
      accounts,
    },
  },
});
