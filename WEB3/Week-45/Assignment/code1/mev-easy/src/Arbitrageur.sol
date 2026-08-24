// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {LiquidityPool} from "./LiquidityPool.sol";

interface IERC20Minimal {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract Arbitrageur {
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    function executeArbitrage(
        LiquidityPool cheapPool,
        LiquidityPool expensivePool,
        IERC20Minimal tokenA,
        IERC20Minimal tokenB,
        uint256 amountIn
    ) external returns (uint256 profit) {
        tokenA.approve(address(cheapPool), amountIn);
        uint256 tokenBReceived = cheapPool.swap(
            amountIn,
            0,
            0,
            block.timestamp
        ); // buy B where it's CHEAP

        tokenB.approve(address(expensivePool), tokenBReceived);
        uint256 tokenAReceived = expensivePool.swap(
            0,
            tokenBReceived,
            0,
            block.timestamp
        ); // sell B where it's EXPENSIVE

        profit = tokenAReceived > amountIn ? tokenAReceived - amountIn : 0;
        tokenA.transfer(owner, tokenAReceived);
    }
}
