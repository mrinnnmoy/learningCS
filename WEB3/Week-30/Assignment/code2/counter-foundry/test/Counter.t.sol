// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;
    address public stranger = address(0xBEEF);

    function setUp() public {
        counter = new Counter();
    }

    function testInitialCountIsZero() public view {
        assertEq(counter.getCount(), 0);
    }

    function testOwnerCanIncrementBy() public {
        counter.incrementBy(5);
        assertEq(counter.getCount(), 5);
    }

    function testStrangerCannotIncrementBy() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(Counter.NotOwner.selector, stranger)
        );
        counter.incrementBy(5);
    }

    function testDecrementRevertsAtZero() public {
        vm.expectRevert(Counter.CountUnderflow.selector);
        counter.decrement();
    }
}
