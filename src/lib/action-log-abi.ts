/**
 * Typed ABI for ActionLog (Solidity 0.8.20) — taskHash + result.
 */
export const ACTION_LOG_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "uint256", name: "actionId", type: "uint256" },
      { indexed: true,  internalType: "address", name: "actor",    type: "address" },
      { indexed: false, internalType: "bytes32", name: "taskHash",   type: "bytes32" },
      { indexed: false, internalType: "string",  name: "result",     type: "string"  },
    ],
    name: "ActionLogged",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "actions",
    outputs: [
      { internalType: "address", name: "actor",     type: "address"  },
      { internalType: "bytes32", name: "taskHash",  type: "bytes32"  },
      { internalType: "string",  name: "result",    type: "string"   },
      { internalType: "uint64",  name: "timestamp", type: "uint64"   },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "taskHash", type: "bytes32" },
      { internalType: "string",  name: "result",   type: "string"  },
    ],
    name: "logAction",
    outputs: [{ internalType: "uint256", name: "actionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
