// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {BatchAuction} from "../src/BatchAuction.sol";

contract BatchAuctionTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    address alice = address(0xA1);
    address bob = address(0xB1);
    address carol = address(0xC1);

    function _setUpBatch() internal returns (BatchAuction auction) {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        auction = new BatchAuction(address(tokenA), address(tokenB));

        tokenA.mint(alice, 100 ether);
        tokenA.mint(bob, 50 ether);
        tokenB.mint(carol, 120 ether);

        vm.prank(alice);
        tokenA.approve(address(auction), 100 ether);
        vm.prank(bob);
        tokenA.approve(address(auction), 50 ether);
        vm.prank(carol);
        tokenB.approve(address(auction), 120 ether);
    }

    function testFix_SubmissionOrderDoesNotAffectTheClearingPrice() public {
        // Order A: alice, then bob, then carol
        BatchAuction auctionA = _setUpBatch();
        vm.prank(alice);
        auctionA.submitBuyIntent(100 ether);
        vm.prank(bob);
        auctionA.submitBuyIntent(50 ether);
        vm.prank(carol);
        auctionA.submitSellIntent(120 ether);
        auctionA.settleBatch();
        uint256 aliceReceivedOrderA = tokenB.balanceOf(alice);

        // Order B: carol, then bob, then alice — the EXACT SAME intents, reversed
        BatchAuction auctionB = _setUpBatch();
        vm.prank(carol);
        auctionB.submitSellIntent(120 ether);
        vm.prank(bob);
        auctionB.submitBuyIntent(50 ether);
        vm.prank(alice);
        auctionB.submitBuyIntent(100 ether);
        auctionB.settleBatch();
        uint256 aliceReceivedOrderB = tokenB.balanceOf(alice);

        // Concept 9's own entire point: identical intents, opposite submission order, IDENTICAL result.
        assertEq(aliceReceivedOrderA, aliceReceivedOrderB);
    }
}
