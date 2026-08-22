// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {MinimalAccount} from "../src/MinimalAccount.sol";
import {SponsorPaymaster} from "../src/SponsorPaymaster.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract SponsoredTransactionTest is Test {
    IEntryPoint entryPoint;
    MinimalAccount account;
    SponsorPaymaster paymaster;
    MockERC20 token;

    uint256 ownerKey = 0xA11CE;
    address owner;
    address bundler = address(0xB0B);
    address recipient = address(0xCAFE);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("sepolia"));

        entryPoint = IEntryPoint(
            0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108
        );

        owner = vm.addr(ownerKey);

        account = new MinimalAccount(
            address(entryPoint),
            owner
        );

        // The CREATE address can already have ETH on the real Sepolia fork.
        // Force the smart account to hold exactly ZERO ETH.
        vm.deal(address(account), 0);

        token = new MockERC20("Test Token", "TST");
        token.mint(address(account), 1000 ether);

        paymaster = new SponsorPaymaster(
            address(entryPoint),
            address(account)
        );

        // Fund the test contract so it can fund the paymaster.
        vm.deal(address(this), 5 ether);

        // Deposit real ETH into the real EntryPoint on behalf of the paymaster.
        paymaster.fund{value: 2 ether}();

        // Confirm the paymaster actually has an EntryPoint deposit.
        assertGt(entryPoint.balanceOf(address(paymaster)), 0);
    }

    function _buildUserOp(
        bytes memory paymasterAndData
    ) internal view returns (PackedUserOperation memory userOp) {
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

        userOp = PackedUserOperation({
            sender: address(account),
            nonce: entryPoint.getNonce(address(account), 0),
            initCode: "",
            callData: callData,
            accountGasLimits: bytes32(
                (uint256(200_000) << 128) |
                uint256(200_000)
            ),
            preVerificationGas: 50_000,
            gasFees: bytes32(
                (uint256(1 gwei) << 128) |
                uint256(1 gwei)
            ),
            paymasterAndData: paymasterAndData,
            signature: ""
        });
    }

    function _signUserOp(
        PackedUserOperation memory userOp
    ) internal view returns (PackedUserOperation memory) {
        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);

        bytes32 ethSignedHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                userOpHash
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ownerKey,
            ethSignedHash
        );

        userOp.signature = abi.encodePacked(r, s, v);

        return userOp;
    }

    function testFix_ZeroEthAccountSucceedsViaSponsoredPaymaster() public {
        // The account must genuinely have zero ETH.
        assertEq(address(account).balance, 0);

        // ERC-4337 v0.8 paymasterAndData:
        //
        // 20 bytes  = paymaster address
        // 16 bytes  = paymaster verification gas limit
        // 16 bytes  = paymaster postOp gas limit
        //
        bytes memory paymasterAndData = abi.encodePacked(
            address(paymaster),
            uint128(100_000),
            uint128(50_000)
        );

        PackedUserOperation memory userOp = _buildUserOp(
            paymasterAndData
        );

        userOp = _signUserOp(userOp);

        PackedUserOperation[] memory ops =
            new PackedUserOperation[](1);

        ops[0] = userOp;

        // The account has ZERO ETH.
        assertEq(address(account).balance, 0);

        // The paymaster has deposited ETH into the real EntryPoint.
        assertGt(entryPoint.balanceOf(address(paymaster)), 0);

        vm.prank(bundler);
        entryPoint.handleOps(
            ops,
            payable(bundler)
        );

        // The operation executed successfully despite the account
        // holding zero ETH.
        assertEq(
            token.balanceOf(recipient),
            100 ether
        );
    }

    function testExploit_UnsponsoredZeroEthAccountFails() public {
        // The account genuinely has zero ETH.
        assertEq(address(account).balance, 0);

        // No paymaster attached.
        PackedUserOperation memory userOp = _buildUserOp("");

        userOp = _signUserOp(userOp);

        PackedUserOperation[] memory ops =
            new PackedUserOperation[](1);

        ops[0] = userOp;

        // Because there is no paymaster and the account has zero ETH,
        // EntryPoint cannot obtain the required prefund.
        vm.expectRevert();

        vm.prank(bundler);
        entryPoint.handleOps(
            ops,
            payable(bundler)
        );

        // The transfer must never have happened.
        assertEq(
            token.balanceOf(recipient),
            0
        );
    }
}