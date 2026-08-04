// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {NativeToken} from "./NativeToken.sol";

contract MultisigBridge {
    NativeToken public token;
    address[] public relayers;
    uint256 public immutable threshold;
    mapping(bytes32 => bool) public processedMessages;

    error InsufficientSignatures();
    error DuplicateSigner();
    error NotARelayer(address signer);
    error MessageAlreadyProcessed();

    event BurnedForBridge(address indexed user, uint256 amount, uint256 nonce);

    constructor(address[] memory _relayers, uint256 _threshold) {
        relayers = _relayers;
        threshold = _threshold;
    }

    function setToken(address _token) external {
        token = NativeToken(_token); // simplified two-step wiring — the token needs this bridge's own address first
    }

    function burnForBridge(uint256 amount, uint256 nonce) external {
        token.burn(msg.sender, amount);
        emit BurnedForBridge(msg.sender, amount, nonce);
    }

    function mintWithSignatures(
        address recipient,
        uint256 amount,
        uint256 nonce,
        bytes[] calldata signatures
    ) external {
        bytes32 messageHash = keccak256(
            abi.encode(recipient, amount, nonce, block.chainid, address(this))
        );
        if (processedMessages[messageHash]) revert MessageAlreadyProcessed();

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

        address[] memory seen = new address[](signatures.length);
        uint256 validCount;
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(ethSignedHash, signatures[i]);
            if (!_isRelayer(signer)) revert NotARelayer(signer);
            for (uint256 j = 0; j < validCount; j++) {
                if (seen[j] == signer) revert DuplicateSigner();
            }
            seen[validCount] = signer;
            validCount++;
        }

        if (validCount < threshold) revert InsufficientSignatures();

        processedMessages[messageHash] = true;
        token.mint(recipient, amount);
    }

    function _isRelayer(address addr) internal view returns (bool) {
        for (uint256 i = 0; i < relayers.length; i++) {
            if (relayers[i] == addr) return true;
        }
        return false;
    }
}
