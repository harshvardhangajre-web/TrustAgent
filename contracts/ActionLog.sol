// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title ActionLog
 * @notice On-chain audit log for Trust-Agent (Shardeum Mezame).
 * @dev Stores a bytes32 task fingerprint (e.g. keccak256 of pitch) and the AI result payload.
 */
contract ActionLog {
    struct Action {
        address actor;
        bytes32 taskHash;
        string result;
        uint64 timestamp;
    }

    mapping(uint256 => Action) public actions;
    uint256 public count;

    event ActionLogged(
        uint256 indexed actionId,
        address indexed actor,
        bytes32 taskHash,
        string result
    );

    /**
     * @param taskHash Cryptographic fingerprint of the task input (e.g. keccak256(utf8(pitch))).
     * @param result   Opaque result string (e.g. JSON from the LLM).
     */
    function logAction(bytes32 taskHash, string memory result) external returns (uint256 actionId) {
        unchecked {
            actionId = count + 1;
            count = actionId;
        }

        actions[actionId] = Action({
            actor: msg.sender,
            taskHash: taskHash,
            result: result,
            timestamp: uint64(block.timestamp)
        });

        emit ActionLogged(actionId, msg.sender, taskHash, result);
    }
}
