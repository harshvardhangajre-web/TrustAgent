import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ActionLog = await ethers.getContractFactory("ActionLog");
  const actionLog = await ActionLog.deploy();
  await actionLog.waitForDeployment();

  console.log("ActionLog deployed to:", actionLog.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
