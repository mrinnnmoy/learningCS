// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

// A naive constant-product AMM, no fee, for demonstration only.
// spotPriceBPerA() is THE vulnerability this week's Hard assignment studies (Concept 6).
contract SimplePool {
    MockERC20 public immutable tokenA;
    MockERC20 public immutable tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

    constructor(address _tokenA, address _tokenB) {
        tokenA = MockERC20(_tokenA);
        tokenB = MockERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
    }

    function swapAForB(
        uint256 amountAIn
    ) external returns (uint256 amountBOut) {
        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        amountBOut = (reserveB * amountAIn) / (reserveA + amountAIn);
        reserveA += amountAIn;
        reserveB -= amountBOut;
        tokenB.transfer(msg.sender, amountBOut);
    }

    function swapBForA(
        uint256 amountBIn
    ) external returns (uint256 amountAOut) {
        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        amountAOut = (reserveA * amountBIn) / (reserveB + amountBIn);
        reserveB += amountBIn;
        reserveA -= amountAOut;
        tokenA.transfer(msg.sender, amountAOut);
    }

    // VULNERABLE — spot price read directly from current reserves, manipulable within one tx (Concept 6).
    function spotPriceBPerA() external view returns (uint256) {
        return (reserveB * 1e18) / reserveA;
    }
}
