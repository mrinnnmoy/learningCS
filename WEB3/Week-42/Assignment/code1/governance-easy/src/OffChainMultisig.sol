// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract OffChainMultisig {
    address[] public owners;
    uint256 public immutable threshold;
    mapping(address => bool) public isOwner;
    mapping(uint256 => bool) public usedNonces;

    error InsufficientSignatures();
    error DuplicateSigner();
    error NotAnOwner(address signer);
    error NonceAlreadyUsed();
    error ExecutionFailed();

    constructor(address[] memory _owners, uint256 _threshold) {
        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        threshold = _threshold;
    }

    receive() external payable {}

    function executeWithSignatures(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce,
        bytes[] calldata signatures
    ) external {
        if (usedNonces[nonce]) revert NonceAlreadyUsed();
        usedNonces[nonce] = true;

        bytes32 messageHash = keccak256(
            abi.encode(to, value, data, nonce, address(this))
        );
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

        address[] memory seen = new address[](signatures.length);
        uint256 validCount;
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(ethSignedHash, signatures[i]);
            if (!isOwner[signer]) revert NotAnOwner(signer);
            for (uint256 j = 0; j < validCount; j++) {
                if (seen[j] == signer) revert DuplicateSigner();
            }
            seen[validCount] = signer;
            validCount++;
        }
        if (validCount < threshold) revert InsufficientSignatures();

        (bool ok, ) = to.call{value: value}(data);
        if (!ok) revert ExecutionFailed();
    }
}
