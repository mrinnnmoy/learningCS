// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {
    PackedUserOperation
} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {SocialRecoveryAccount} from "../src/SocialRecoveryAccount.sol";

contract SocialRecoveryTest is Test {
    IEntryPoint entryPoint;
    SocialRecoveryAccount account;

    uint256 originalOwnerKey = 0xA11CE;
    uint256 newOwnerKey = 0xB0B5;
    uint256 guardian1Key = 0x1;
    uint256 guardian2Key = 0x2;
    address originalOwner;
    address newOwner;
    address guardian1;
    address guardian2;
    address bundler = address(0xB0B);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("sepolia"));
        entryPoint = IEntryPoint(0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108);

        originalOwner = vm.addr(originalOwnerKey);
        newOwner = vm.addr(newOwnerKey);
        guardian1 = vm.addr(guardian1Key);
        guardian2 = vm.addr(guardian2Key);

        address[] memory guardians = new address[](2);
        guardians[0] = guardian1;
        guardians[1] = guardian2;

        account = new SocialRecoveryAccount(
            address(entryPoint),
            originalOwner,
            guardians,
            2
        );
        vm.deal(address(account), 1 ether);
    }

    function _sign(
        uint256 key,
        bytes32 hash
    ) internal pure returns (bytes memory) {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function _validateWith(
        uint256 signerKey
    ) internal returns (uint256 validationData) {
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(account),
            nonce: entryPoint.getNonce(address(account), 0),
            initCode: "",
            callData: "",
            accountGasLimits: bytes32(
                (uint256(200_000) << 128) | uint256(200_000)
            ),
            preVerificationGas: 50_000,
            gasFees: bytes32((uint256(1 gwei) << 128) | uint256(1 gwei)),
            paymasterAndData: "",
            signature: ""
        });
        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);
        userOp.signature = _sign(signerKey, userOpHash);

        vm.prank(address(entryPoint));
        return account.validateUserOp(userOp, userOpHash, 0);
    }

    function testFix_GuardiansRecoverOwnershipAndOldKeyStopsWorking() public {
        assertEq(_validateWith(originalOwnerKey), 0); // works BEFORE recovery

        bytes32 recoveryHash = keccak256(
            abi.encode(newOwner, address(account))
        );
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = _sign(guardian1Key, recoveryHash);
        signatures[1] = _sign(guardian2Key, recoveryHash);

        account.recoverOwnership(newOwner, signatures);

        assertEq(account.owner(), newOwner);
        assertEq(_validateWith(originalOwnerKey), 1); // the OLD key now fails — Concept 9's own real claim
        assertEq(_validateWith(newOwnerKey), 0); // the NEW key works immediately
    }

    function testExploit_InsufficientGuardianSignaturesCannotRecover() public {
        bytes32 recoveryHash = keccak256(
            abi.encode(newOwner, address(account))
        );
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = _sign(guardian1Key, recoveryHash); // only ONE of the required TWO

        vm.expectRevert(
            SocialRecoveryAccount.InsufficientGuardianSignatures.selector
        );
        account.recoverOwnership(newOwner, signatures);
    }
}
