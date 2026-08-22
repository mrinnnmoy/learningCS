// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {
    PackedUserOperation
} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {MinimalAccount} from "../src/MinimalAccount.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract MinimalAccountTest is Test {
    IEntryPoint entryPoint;
    MinimalAccount account;
    MockERC20 token;

    uint256 ownerKey = 0xA11CE;
    address owner;
    address bundler = address(0xB0B);
    address recipient = address(0xCAFE);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("sepolia")); // Tutorial, step 3 — the REAL EntryPoint now exists
        entryPoint = IEntryPoint(0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108);

        owner = vm.addr(ownerKey);
        account = new MinimalAccount(address(entryPoint), owner);
        vm.deal(address(account), 1 ether);

        token = new MockERC20("Test Token", "TST");
        token.mint(address(account), 1000 ether);
    }

    function _packUints(
        uint128 high,
        uint128 low
    ) internal pure returns (bytes32) {
        return bytes32((uint256(high) << 128) | uint256(low)); // Concept 3's own packing detail
    }

    function testFix_UserOperationExecutesViaTheRealEntryPoint() public {
        bytes memory callData = abi.encodeWithSelector(
            MinimalAccount.execute.selector,
            address(token),
            0,
            abi.encodeWithSelector(
                token.transfer.selector,
                recipient,
                100 ether
            )
        );

        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(account),
            nonce: entryPoint.getNonce(address(account), 0),
            initCode: "",
            callData: callData,
            accountGasLimits: _packUints(200_000, 200_000),
            preVerificationGas: 50_000,
            gasFees: _packUints(1 gwei, 1 gwei),
            paymasterAndData: "",
            signature: ""
        });

        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerKey, ethSignedHash);
        userOp.signature = abi.encodePacked(r, s, v);

        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = userOp;

        vm.prank(bundler); // Concept 4, 5 — playing the bundler's own real role, honestly
        entryPoint.handleOps(ops, payable(bundler));

        assertEq(token.balanceOf(recipient), 100 ether);
    }
}