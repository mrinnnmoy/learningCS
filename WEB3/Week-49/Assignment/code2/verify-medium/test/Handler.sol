// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VaultWithBug} from "../src/VaultWithBug.sol";

contract Handler is Test {
    VaultWithBug public vault;

    // Ghost variable tracking the total liabilities created by actions.
    uint256 public totalTrackedClaims;

    constructor(VaultWithBug _vault) {
        vault = _vault;
    }

    function deposit(uint256 amount) public {
        amount = bound(amount, 0, 1000 ether);

        vm.deal(address(this), amount);

        vault.deposit{value: amount}();

        totalTrackedClaims += amount;
    }

    function withdraw(uint256 amount) public {
        uint256 ownBalance = vault.balances(address(this));

        amount = bound(amount, 0, ownBalance);

        vault.withdraw(amount);

        totalTrackedClaims -= amount;
    }

    function creditReward(address user, uint256 amount) public {
        amount = bound(amount, 0, 100 ether);

        vault.creditReward(user, amount);

        // BUG detection:
        // A new liability was created, but no ETH entered the vault.
        totalTrackedClaims += amount;
    }

    receive() external payable {}
}
