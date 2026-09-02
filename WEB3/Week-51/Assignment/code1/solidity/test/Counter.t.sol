// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter counter;

    address user = address(0x123);

    function setUp() public {
        counter = new Counter();
    }

    // Test 1: Initial state
    function test_InitialOwnerAndCount() public view {
        assertEq(counter.owner(), address(this));
        assertEq(counter.getCount(), 0);
    }

    // Test 2: Anyone can increment
    function test_Increment() public {
        vm.prank(user);

        counter.increment();

        assertEq(counter.getCount(), 1);
    }

    // Test 3: Only owner can increment by a specific amount
    function test_OwnerCanIncrementBy() public {
        counter.incrementBy(10);

        assertEq(counter.getCount(), 10);
    }

    // Test 4: Non-owner cannot call incrementBy
    function test_NonOwnerCannotIncrementBy() public {
        vm.expectRevert(
            abi.encodeWithSelector(Counter.NotOwner.selector, user)
        );

        vm.prank(user);
        counter.incrementBy(10);
    }

    // Test 5: Decrement works and prevents underflow
    function test_DecrementAndUnderflow() public {
        counter.increment();

        counter.decrement();

        assertEq(counter.getCount(), 0);

        vm.expectRevert(Counter.CountUnderflow.selector);
        counter.decrement();
    }
}
