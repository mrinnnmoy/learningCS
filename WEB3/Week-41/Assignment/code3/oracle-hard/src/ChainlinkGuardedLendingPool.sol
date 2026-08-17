// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {
    AggregatorV3Interface
} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {MockERC20} from "./MockERC20.sol";

contract ChainlinkGuardedLendingPool {
    MockERC20 public immutable collateralToken;
    MockERC20 public immutable borrowToken;
    AggregatorV3Interface public immutable priceFeed; // Concept 4 — a REAL Chainlink-shaped source, not the manipulable pool
    uint256 public constant MAX_STALENESS = 1 hours;

    mapping(address => uint256) public collateralDeposited;
    mapping(address => uint256) public borrowed;

    error StalePrice(uint256 updatedAt);

    constructor(
        address _collateralToken,
        address _borrowToken,
        address _priceFeed
    ) {
        collateralToken = MockERC20(_collateralToken);
        borrowToken = MockERC20(_borrowToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);
        collateralDeposited[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        if (block.timestamp - updatedAt > MAX_STALENESS)
            revert StalePrice(updatedAt); // Concept 6

        uint256 collateralValue = (collateralDeposited[msg.sender] *
            uint256(price)) / 1e8; // matching MockV3Aggregator's own 8-decimal convention
        require(
            borrowed[msg.sender] + amount <= collateralValue,
            "exceeds collateral value"
        );
        borrowed[msg.sender] += amount;
        borrowToken.transfer(msg.sender, amount);
    }
}
