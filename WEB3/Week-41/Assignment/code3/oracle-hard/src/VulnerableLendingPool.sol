// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";
import {SimplePool} from "./SimplePool.sol";

// VULNERABLE ON PURPOSE — prices collateral off a manipulable AMM spot price (Concept 6). Never ship this.
contract VulnerableLendingPool {
    MockERC20 public immutable collateralToken;
    MockERC20 public immutable borrowToken;
    SimplePool public immutable priceSource;

    mapping(address => uint256) public collateralDeposited;
    mapping(address => uint256) public borrowed;

    constructor(
        address _collateralToken,
        address _borrowToken,
        address _priceSource
    ) {
        collateralToken = MockERC20(_collateralToken);
        borrowToken = MockERC20(_borrowToken);
        priceSource = SimplePool(_priceSource);
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);
        collateralDeposited[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        uint256 collateralValue = (collateralDeposited[msg.sender] *
            priceSource.spotPriceBPerA()) / 1e18;
        require(
            borrowed[msg.sender] + amount <= collateralValue,
            "exceeds collateral value"
        );
        borrowed[msg.sender] += amount;
        borrowToken.transfer(msg.sender, amount);
    }
}
