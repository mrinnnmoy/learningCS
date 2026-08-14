// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {Marketplace} from "../src/Marketplace.sol";

contract PaginationTest is Test {
    Marketplace market;

    function setUp() public {
        market = new Marketplace();
        for (uint256 i = 0; i < 200; i++) {
            market.createListing(1 ether, "Listing");
        }
    }

    function testFix_PaginatedReadCostsFarLessThanUnboundedRead() public {
        uint256 gasBeforeAll = gasleft();
        market.getAllListings();
        uint256 allGas = gasBeforeAll - gasleft();

        uint256 gasBeforePage = gasleft();
        market.getListings(0, 20);
        uint256 pageGas = gasBeforePage - gasleft();

        console.log("getAllListings() gas, 200 listings:", allGas);
        console.log("getListings(0, 20) gas:", pageGas);
        assertLt(pageGas, allGas);
    }

    function testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage()
        public
    {
        // 200 listings total, asking for a page starting near the very end.
        Marketplace.Listing[] memory page = market.getListings(190, 20); // would run past index 199
        assertEq(page.length, 10); // correctly truncated — only 10 real listings remain from index 190
    }
}
