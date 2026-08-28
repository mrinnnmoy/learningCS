// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {LiquidRestakingToken} from "../src/LiquidRestakingToken.sol";

contract LiquidRestakingTokenTest is Test {
    LiquidRestakingToken lrt;
    address alice = address(0xA1);
    address bob = address(0xB1);
    address avsSlasher = address(0xC1);
    bytes32 constant AVS_ID = keccak256("OracleAVS");

    function setUp() public {
        lrt = new LiquidRestakingToken();
        lrt.registerAVS(AVS_ID, avsSlasher);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testFix_SharesMintedProportionallyAtTheCurrentRate() public {
        vm.prank(alice);
        uint256 aliceShares = lrt.deposit{value: 100 ether}();
        assertEq(aliceShares, 100 ether); // first depositor — 1:1

        vm.prank(bob);
        uint256 bobShares = lrt.deposit{value: 100 ether}();
        assertEq(bobShares, 100 ether); // identical rate — no slash or reward has happened yet
    }

    function testFix_SlashDropsTheExchangeRateForEveryHolderProportionally()
        public
    {
        vm.prank(alice);
        uint256 aliceShares = lrt.deposit{value: 100 ether}();
        vm.prank(bob);
        uint256 bobShares = lrt.deposit{value: 100 ether}();

        // A real slash — 20% of the ENTIRE pool, 40 out of 200 ether total.
        vm.prank(avsSlasher);
        lrt.slash(AVS_ID, 40 ether);

        // Neither holder's own SHARE COUNT changed at all — only what each share is now worth.
        uint256 aliceRedeemable = (aliceShares * lrt.totalRestaked()) /
            lrt.totalSupply();
        uint256 bobRedeemable = (bobShares * lrt.totalRestaked()) /
            lrt.totalSupply();

        assertEq(aliceRedeemable, 80 ether); // 100 * (160/200) — down from 100, proportionally
        assertEq(bobRedeemable, 80 ether); // Concept 4, 5 — the IDENTICAL proportional loss, socialized
    }
}
