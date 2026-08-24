// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

contract SimpleLendingPool {
    MockERC20 public immutable collateralToken;
    MockERC20 public immutable borrowToken;

    // Owner-settable, simulating an oracle (Week 41) — 1e18-scaled
    uint256 public collateralPrice;

    address public immutable owner;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    // 5% liquidation incentive for the winning searcher
    uint256 public constant LIQUIDATION_BONUS_BPS = 500;

    error NotOwner();
    error ExceedsCollateralValue();
    error NotLiquidatable();
    error RepayAmountTooHigh();

    constructor(
        address _collateralToken,
        address _borrowToken,
        uint256 _initialPrice
    ) {
        collateralToken = MockERC20(_collateralToken);
        borrowToken = MockERC20(_borrowToken);
        collateralPrice = _initialPrice;
        owner = msg.sender;
    }

    function setPrice(uint256 newPrice) external {
        if (msg.sender != owner) revert NotOwner();

        collateralPrice = newPrice;
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);

        collateral[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        uint256 collateralValue = (collateral[msg.sender] * collateralPrice) /
            1e18;

        if (debt[msg.sender] + amount > collateralValue) {
            revert ExceedsCollateralValue();
        }

        debt[msg.sender] += amount;

        borrowToken.transfer(msg.sender, amount);
    }

    function isLiquidatable(address user) public view returns (bool) {
        uint256 collateralValue = (collateral[user] * collateralPrice) / 1e18;

        return debt[user] > collateralValue;
    }

    function liquidate(address user, uint256 repayAmount) external {
        // The position must still be unhealthy.
        // The second searcher in the race should fail here.
        if (!isLiquidatable(user)) {
            revert NotLiquidatable();
        }

        // A liquidator cannot repay more than the user's outstanding debt.
        if (repayAmount > debt[user]) {
            revert RepayAmountTooHigh();
        }

        // The liquidator repays the borrower's debt.
        borrowToken.transferFrom(msg.sender, address(this), repayAmount);

        debt[user] -= repayAmount;

        // Calculate collateral seized, including the 5% liquidation bonus.
        uint256 collateralSeized = (repayAmount *
            (10000 + LIQUIDATION_BONUS_BPS) *
            1e18) / (10000 * collateralPrice);

        // Never seize more collateral than the borrower actually has.
        if (collateralSeized > collateral[user]) {
            collateralSeized = collateral[user];
        }

        collateral[user] -= collateralSeized;

        // Transfer seized collateral to the winning liquidator.
        collateralToken.transfer(msg.sender, collateralSeized);
    }
}
