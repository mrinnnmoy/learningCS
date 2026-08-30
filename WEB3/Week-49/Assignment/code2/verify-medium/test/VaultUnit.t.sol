// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VaultWithBug} from "../src/VaultWithBug.sol";

contract VaultUnitTest is Test {
    VaultWithBug vault;

    receive() external payable {}

    function setUp() public {
        vault = new VaultWithBug();
    }

    // An entirely ordinary, hand-written test — deposit, withdraw, confirm the balance.
    // This test NEVER calls creditReward at all, and passes cleanly — Concept 1's own real point.
    function testFix_DepositThenWithdrawWorksNormally() public {
        vm.deal(address(this), 10 ether);
        vault.deposit{value: 10 ether}();
        vault.withdraw(5 ether);

        assertEq(vault.balances(address(this)), 5 ether);
        assertEq(address(vault).balance, 5 ether);
    }
}
