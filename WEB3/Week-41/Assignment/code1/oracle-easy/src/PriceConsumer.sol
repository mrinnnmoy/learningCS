// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {
    AggregatorV3Interface
} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface public immutable priceFeed;
    uint256 public constant MAX_STALENESS = 1 hours;

    error StalePrice(uint256 updatedAt);

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() external view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();

        if (block.timestamp - updatedAt > MAX_STALENESS)
            revert StalePrice(updatedAt); // Concept 6

        uint8 feedDecimals = priceFeed.decimals();
        return uint256(price) * (10 ** (18 - feedDecimals)); // scale to 18 decimals, regardless of the feed's own native count
    }
}
