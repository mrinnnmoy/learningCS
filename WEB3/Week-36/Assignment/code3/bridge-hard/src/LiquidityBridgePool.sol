// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

contract LiquidityBridgePool {
    MockERC20 public immutable token;
    mapping(address => uint256) public liquidityProvided;
    uint256 public constant FEE_BPS = 30; // 0.3%, Week 34's own fee convention

    error InsufficientLiquidity();

    event Deposited(
        address indexed user,
        uint256 amount,
        uint256 destinationChainId,
        address recipient
    );
    event Released(address indexed recipient, uint256 amount);

    constructor(address _token) {
        token = MockERC20(_token);
    }

    function addLiquidity(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        liquidityProvided[msg.sender] += amount;
    }

    function deposit(
        uint256 amount,
        uint256 destinationChainId,
        address recipient
    ) external {
        token.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount, destinationChainId, recipient);
    }

    function release(address recipient, uint256 amount) external {
        uint256 fee = (amount * FEE_BPS) / 10000;
        uint256 payout = amount - fee;
        if (payout > token.balanceOf(address(this)))
            revert InsufficientLiquidity();
        token.transfer(recipient, payout);
        emit Released(recipient, payout);
    }
}
