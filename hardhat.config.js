import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";

const RPC_URL = process.env.NEXT_PUBLIC_SHARDEUM_RPC || "https://api-mezame.shardeum.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    mezame: {
      url: RPC_URL,
      chainId: 8119,
      type: "http",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
