// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {SimpleVault} from "../src/SimpleVault.sol";
import {BuggyVault} from "../src/BuggyVault.sol";

contract FuzzBasicsTest is Test {
    SimpleVault vault;
    BuggyVault buggyVault;

    // Allow this test contract to receive ETH from withdraw().
    receive() external payable {}

    function setUp() public {
        vault = new SimpleVault();
        buggyVault = new BuggyVault();
    }

    function testFuzz_DepositThenWithdrawReturnsExactAmount(
        uint96 amount
    ) public {
        amount = uint96(bound(amount, 1, 1000 ether));

        uint256 originalBalance = 10_000 ether;

        vm.deal(address(this), originalBalance);

        vault.deposit{value: amount}();
        vault.withdraw(amount);

        assertEq(address(this).balance, originalBalance);
    }

    function testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance(
        uint96 amount
    ) public {
        amount = uint96(bound(amount, 1, 1000 ether));

        vm.deal(address(this), amount);

        buggyVault.deposit{value: amount}();

        vm.expectRevert();
        buggyVault.withdraw(uint256(amount) + 1);
    }
}
