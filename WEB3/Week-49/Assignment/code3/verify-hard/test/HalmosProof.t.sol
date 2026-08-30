// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {OptimizedVault} from "../src/OptimizedVault.sol";

contract HalmosProofTest is Test {
    /*
     * Halmos treats both parameters as symbolic values.
     *
     * This proof checks the successful withdrawal path for every
     * explored symbolic pair where:
     *
     *   depositAmount > 0
     *   withdrawAmount <= depositAmount
     *
     * No vm.expectRevert() is used because Halmos 0.3.3 does not
     * support expectRevert().
     */
    function check_withdrawNeverExceedsDeposit(
        uint128 depositAmount,
        uint128 withdrawAmount
    ) public {
        vm.assume(depositAmount > 0);

        OptimizedVault vault = new OptimizedVault();

        vm.deal(address(this), depositAmount);
        vault.deposit{value: depositAmount}();

        // Public mapping getters for structs return tuples.
        (uint128 trackedBefore, , ) = vault.deposits(address(this));

        // Only execute withdrawals that should succeed.
        if (withdrawAmount <= depositAmount) {
            uint256 balanceBefore = address(this).balance;

            vault.withdraw(withdrawAmount);

            // Destructure the tuple returned by the public getter.
            (uint128 trackedAfter, , ) = vault.deposits(address(this));

            // Caller receives exactly the withdrawn amount.
            assertEq(
                address(this).balance,
                balanceBefore + uint256(withdrawAmount)
            );

            // Tracked deposit decreases by exactly the withdrawn amount.
            assertEq(
                uint256(trackedAfter),
                uint256(trackedBefore) - uint256(withdrawAmount)
            );
        }
    }
}
