// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    MockV3Aggregator
} from "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
import {PriceConsumer} from "../src/PriceConsumer.sol";

contract PriceConsumerTest is Test {
    MockV3Aggregator mockFeed;
    PriceConsumer consumer;

    function setUp() public {
        mockFeed = new MockV3Aggregator(8, 2000e8); // 8 decimals, $2000.00000000 — Chainlink's own real convention
        consumer = new PriceConsumer(address(mockFeed));
    }

    function testFix_ConvertsToEighteenDecimalsCorrectly() public view {
        uint256 price = consumer.getLatestPrice();
        assertEq(price, 2000e18); // $2000, scaled from the feed's native 8 decimals up to 18
    }

    function testFix_FreshPriceDoesNotRevert() public view {
        consumer.getLatestPrice(); // updatedAt is "now" by MockV3Aggregator's own default — should succeed
    }

    function testExploit_StalePriceReverts() public {
        vm.warp(block.timestamp + 2 hours); // Week 31's own vm.warp pattern, reused here for a legitimate check

        vm.expectRevert();
        consumer.getLatestPrice();
    }
}
