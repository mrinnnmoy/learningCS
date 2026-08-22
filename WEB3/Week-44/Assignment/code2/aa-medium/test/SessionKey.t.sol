// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {
    PackedUserOperation
} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {SessionKeyAccount} from "../src/SessionKeyAccount.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract SessionKeyTest is Test {
    IEntryPoint entryPoint;
    SessionKeyAccount account;
    MockERC20 allowedToken;
    MockERC20 disallowedToken;

    uint256 ownerKey = 0xA11CE;
    uint256 sessionKeyPrivate = 0x5E55;

    address owner;
    address sessionKeyAddr;
    address bundler = address(0xB0B);
    address recipient = address(0xCAFE);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("sepolia"));

        entryPoint = IEntryPoint(0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108);

        owner = vm.addr(ownerKey);
        sessionKeyAddr = vm.addr(sessionKeyPrivate);

        account = new SessionKeyAccount(address(entryPoint), owner);

        vm.deal(address(account), 1 ether);

        allowedToken = new MockERC20("Allowed", "ALW");
        disallowedToken = new MockERC20("Disallowed", "DIS");

        allowedToken.mint(address(account), 1000 ether);
        disallowedToken.mint(address(account), 1000 ether);

        vm.prank(owner);
        account.setSessionKey(
            sessionKeyAddr,
            address(allowedToken),
            block.timestamp + 1 days
        );
    }

    function _buildAndSubmit(
        uint256 signerKey,
        address target,
        uint256 amount,
        bool expectFailure
    ) internal {
        bytes memory callData = abi.encodeWithSelector(
            SessionKeyAccount.execute.selector,
            target,
            0,
            abi.encodeWithSelector(
                MockERC20.transfer.selector,
                recipient,
                amount
            )
        );

        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(account),
            nonce: entryPoint.getNonce(address(account), 0),
            initCode: "",
            callData: callData,
            accountGasLimits: bytes32(
                (uint256(200_000) << 128) | uint256(200_000)
            ),
            preVerificationGas: 50_000,
            gasFees: bytes32((uint256(1 gwei) << 128) | uint256(1 gwei)),
            paymasterAndData: "",
            signature: ""
        });

        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);

        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, ethSignedHash);

        userOp.signature = abi.encodePacked(r, s, v);

        PackedUserOperation[] memory ops = new PackedUserOperation[](1);

        ops[0] = userOp;

        vm.prank(bundler);

        if (expectFailure) {
            vm.expectRevert();
        }

        entryPoint.handleOps(ops, payable(bundler));
    }

    function testFix_SessionKeySucceedsWithinItsOwnScope() public {
        _buildAndSubmit(
            sessionKeyPrivate,
            address(allowedToken),
            50 ether,
            false
        );

        assertEq(allowedToken.balanceOf(recipient), 50 ether);
    }

    function testExploit_SessionKeyFailsAgainstADisallowedTarget() public {
        _buildAndSubmit(
            sessionKeyPrivate,
            address(disallowedToken),
            50 ether,
            true
        );

        assertEq(disallowedToken.balanceOf(recipient), 0);
    }

    function testExploit_SessionKeyFailsAfterItsOwnExpiry() public {
        vm.warp(block.timestamp + 2 days);

        _buildAndSubmit(
            sessionKeyPrivate,
            address(allowedToken),
            50 ether,
            true
        );

        assertEq(allowedToken.balanceOf(recipient), 0);
    }
}
