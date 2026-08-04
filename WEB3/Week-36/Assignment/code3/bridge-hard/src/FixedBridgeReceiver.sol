// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {MockERC20} from "./MockERC20.sol";

contract FixedBridgeReceiver {
    MockERC20 public immutable token;
    address public immutable relayer;
    mapping(bytes32 => bool) public processedMessages;

    error NotRelayer();
    error MessageAlreadyProcessed();

    constructor(address _token, address _relayer) {
        token = MockERC20(_token);
        relayer = _relayer;
    }

    function mintWithSignature(
        address recipient,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        bytes32 messageHash = keccak256(abi.encode(recipient, amount, nonce));
        if (processedMessages[messageHash]) revert MessageAlreadyProcessed();

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        address signer = ECDSA.recover(ethSignedHash, signature);
        if (signer != relayer) revert NotRelayer();

        processedMessages[messageHash] = true;
        token.mint(recipient, amount);
    }
}
