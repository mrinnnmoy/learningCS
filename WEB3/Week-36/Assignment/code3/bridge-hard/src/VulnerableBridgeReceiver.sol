// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {MockERC20} from "./MockERC20.sol";

// VULNERABLE ON PURPOSE — no replay protection at all (Concept 9, Nomad's own real root cause). Never ship this.
contract VulnerableBridgeReceiver {
    MockERC20 public immutable token;
    address public immutable relayer;

    error NotRelayer();

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
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        address signer = ECDSA.recover(ethSignedHash, signature);
        if (signer != relayer) revert NotRelayer();

        token.mint(recipient, amount); // NOTHING stops this exact signature being submitted again
    }
}
