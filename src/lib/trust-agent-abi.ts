import type { InterfaceAbi } from "ethers";

import TrustAgentArtifact from "../../artifacts/contracts/TrustAgent.sol/TrustAgent.json";

export const TRUST_AGENT_ABI = TrustAgentArtifact.abi as InterfaceAbi;
