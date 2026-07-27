// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VulnerableAuction} from "../src/VulnerableAuction.sol";
import {FixedAuction} from "../src/FixedAuction.sol";

contract RevertingBidder {
    receive() external payable {
        revert("I refuse ETH");
    }
}

contract AuctionSecurityTest is Test {
    function testExploit_RevertingBidderBlocksAllFutureBids() public {
        VulnerableAuction auction = new VulnerableAuction();
        RevertingBidder malicious = new RevertingBidder();

        vm.deal(address(malicious), 1 ether);
        vm.prank(address(malicious));
        auction.bid{value: 1 ether}();   // becomes highest bidder — fine so far

        address honestBidder = address(0xCAFE);
        vm.deal(honestBidder, 2 ether);
        vm.prank(honestBidder);
        vm.expectRevert();   // the auction is now PERMANENTLY stuck — this failure IS the exploit
        auction.bid{value: 2 ether}();
    }

    function testFix_RevertingBidderCannotBlockFutureBids() public {
        FixedAuction auction = new FixedAuction();
        RevertingBidder malicious = new RevertingBidder();

        vm.deal(address(malicious), 1 ether);
        vm.prank(address(malicious));
        auction.bid{value: 1 ether}();

        address honestBidder = address(0xCAFE);
        vm.deal(honestBidder, 2 ether);
        vm.prank(honestBidder);
        auction.bid{value: 2 ether}();   // succeeds — the malicious bidder's revert never blocks this

        assertEq(auction.highestBidder(), honestBidder);
        assertEq(auction.pendingReturns(address(malicious)), 1 ether);   // credited, claimable whenever THEY want
    }
}