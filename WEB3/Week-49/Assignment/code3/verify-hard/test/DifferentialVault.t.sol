// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {UnoptimizedVault} from "../src/UnoptimizedVault.sol";
import {OptimizedVault} from "../src/OptimizedVault.sol";

contract DifferentialVaultTest is Test {
    UnoptimizedVault unoptimized;
    OptimizedVault optimized;

    // Allow this test contract to receive ETH from both vaults.
    receive() external payable {}

    function setUp() public {
        unoptimized = new UnoptimizedVault();
        optimized = new OptimizedVault();
    }

    function testFuzz_BothVaultsAgreeAfterEveryOperation(
        uint96 depositAmount,
        uint96 withdrawAmount
    ) public {
        depositAmount = uint96(bound(depositAmount, 1, 1000 ether));
        withdrawAmount = uint96(bound(withdrawAmount, 0, depositAmount));

        vm.deal(address(this), depositAmount);
        unoptimized.deposit{value: depositAmount}();

        vm.deal(address(this), depositAmount);
        optimized.deposit{value: depositAmount}();

        assertEq(unoptimized.totalDeposited(), optimized.totalDeposited()); // Concept 6 — agree after deposit

        unoptimized.withdraw(withdrawAmount);
        optimized.withdraw(withdrawAmount);

        assertEq(unoptimized.totalDeposited(), optimized.totalDeposited()); // agree after withdraw, EVERY fuzzed pair
    }
}
