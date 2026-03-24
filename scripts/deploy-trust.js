import { network } from "hardhat";

async function main() {
  const connection = await network.connect("mezame");
  const { ethers } = connection;

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "No deployer wallet: set PRIVATE_KEY in .env (Mezame-funded key), then run: npm run hh:deploy:trust"
    );
  }
  const deployer = signers[0];
  const oracleAddr =
    process.env.ORACLE_ADDRESS?.trim() || deployer.address;

  console.log("Deploying TrustAgent with oracle:", oracleAddr);
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("TrustAgent");
  const trustAgent = await Factory.deploy(oracleAddr);
  await trustAgent.waitForDeployment();

  const addr = await trustAgent.getAddress();
  console.log("TrustAgent deployed to:", addr);
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_TRUST_AGENT_ADDRESS=${addr}`);
  console.log(
    "\nOracle must match ORACLE_ADDRESS (or use same wallet as ORACLE_PRIVATE_KEY / PRIVATE_KEY for /api/verify)."
  );

  await connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
