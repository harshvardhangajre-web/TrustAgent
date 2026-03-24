import { network } from "hardhat";

async function main() {
  const connection = await network.connect("mezame");
  const { ethers } = connection;

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("Set PRIVATE_KEY in .env for network mezame before deploying.");
  }
  const deployer = signers[0];
  console.log("Deploying with:", deployer.address);

  const ActionLog = await ethers.getContractFactory("ActionLog");
  const actionLog = await ActionLog.deploy();
  await actionLog.waitForDeployment();

  console.log("ActionLog deployed to:", await actionLog.getAddress());
  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
