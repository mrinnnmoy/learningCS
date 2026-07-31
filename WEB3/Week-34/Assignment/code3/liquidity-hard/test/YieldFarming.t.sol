// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LPStaking} from "../src/LPStaking.sol";

contract YieldFarmingTest is Test {
    MockERC20 lpToken;
    MockERC20 rewardToken;
    LPStaking farm;
    address staker = address(0xD1);

    uint256 constant RATE = 1e17; // 0.1 reward token per staked unit per second, 1e18-scaled

    function setUp() public {
        lpToken = new MockERC20("Fake LP", "FLP");
        rewardToken = new MockERC20("Reward", "RWD");
        farm = new LPStaking(address(lpToken), address(rewardToken), RATE);

        rewardToken.mint(address(farm), 1_000_000 ether); // funded generously, test fixture only
        lpToken.mint(staker, 100 ether);
    }

    function testFix_ClaimPaysExactlyTheSimplifiedFormulaPredicts() public {
        vm.startPrank(staker);
        lpToken.approve(address(farm), 100 ether);
        farm.stake(100 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 1000); // Week 31's own vm.warp pattern, reused for a legitimate purpose

        uint256 expectedReward = (100 ether * RATE * 1000) / 1e18;
        assertEq(farm.pendingReward(staker), expectedReward);

        vm.prank(staker);
        farm.claim();

        assertEq(rewardToken.balanceOf(staker), expectedReward);
        assertEq(farm.pendingReward(staker), 0); // fully claimed, timer reset
    }
}
