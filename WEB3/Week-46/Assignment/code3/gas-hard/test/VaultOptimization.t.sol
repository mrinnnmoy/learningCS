// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {UnoptimizedVault} from "../src/UnoptimizedVault.sol";
import {OptimizedVault} from "../src/OptimizedVault.sol";

contract VaultOptimizationTest is Test {
    UnoptimizedVault unoptimized;
    OptimizedVault optimized;
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        unoptimized = new UnoptimizedVault();
        optimized = new OptimizedVault();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testFix_BothVaultsProduceIdenticalResults() public {
        vm.prank(alice);
        unoptimized.deposit{value: 5 ether}();
        vm.prank(alice);
        optimized.deposit{value: 5 ether}();

        vm.prank(bob);
        unoptimized.deposit{value: 3 ether}();
        vm.prank(bob);
        optimized.deposit{value: 3 ether}();

        assertEq(unoptimized.totalDeposited(), optimized.totalDeposited()); // behavior UNCHANGED — only cost differs

        vm.prank(alice);
        unoptimized.withdraw(2 ether);
        vm.prank(alice);
        optimized.withdraw(2 ether);

        assertEq(unoptimized.totalDeposited(), optimized.totalDeposited());
    }

    function testFix_DepositCostsLessOnOptimizedVault() public {
        vm.prank(alice);
        uint256 gasBefore = gasleft();
        unoptimized.deposit{value: 5 ether}();
        uint256 unoptimizedGas = gasBefore - gasleft();

        vm.prank(bob);
        uint256 gasBefore2 = gasleft();
        optimized.deposit{value: 5 ether}();
        uint256 optimizedGas = gasBefore2 - gasleft();

        console.log("UnoptimizedVault.deposit gas:", unoptimizedGas);
        console.log("OptimizedVault.deposit gas:", optimizedGas);
        assertLt(optimizedGas, unoptimizedGas);
    }

    function testFix_BatchCheckActiveCostsLessOnOptimizedVault() public {
        vm.prank(alice);
        unoptimized.deposit{value: 1 ether}();
        vm.prank(alice);
        optimized.deposit{value: 1 ether}();

        address[] memory users = new address[](3);
        users[0] = alice;
        users[1] = bob;
        users[2] = address(0xC1);

        uint256 gasBefore = gasleft();
        unoptimized.batchCheckActive(users);
        uint256 unoptimizedGas = gasBefore - gasleft();

        uint256 gasBefore2 = gasleft();
        optimized.batchCheckActive(users);
        uint256 optimizedGas = gasBefore2 - gasleft();

        console.log("UnoptimizedVault.batchCheckActive gas:", unoptimizedGas);
        console.log("OptimizedVault.batchCheckActive gas:", optimizedGas);
        assertLt(optimizedGas, unoptimizedGas);
    }

    function testFix_TotalDepositedCostsLessOnOptimizedVault() public {
        address carol = address(0xC1);
        address dave = address(0xD1);
        address eve = address(0xE1);

        vm.deal(carol, 10 ether);
        vm.deal(dave, 10 ether);
        vm.deal(eve, 10 ether);

        address[] memory users = new address[](5);
        users[0] = alice;
        users[1] = bob;
        users[2] = carol;
        users[3] = dave;
        users[4] = eve;

        for (uint256 i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            unoptimized.deposit{value: 1 ether}();

            vm.prank(users[i]);
            optimized.deposit{value: 1 ether}();
        }

        uint256 gasBefore = gasleft();
        uint256 unoptimizedTotal = unoptimized.totalDeposited();
        uint256 unoptimizedGas = gasBefore - gasleft();

        uint256 gasBefore2 = gasleft();
        uint256 optimizedTotal = optimized.totalDeposited();
        uint256 optimizedGas = gasBefore2 - gasleft();

        assertEq(unoptimizedTotal, optimizedTotal);

        console.log("UnoptimizedVault.totalDeposited gas:", unoptimizedGas);
        console.log("OptimizedVault.totalDeposited gas:", optimizedGas);

        assertLt(optimizedGas, unoptimizedGas);
    }
}
