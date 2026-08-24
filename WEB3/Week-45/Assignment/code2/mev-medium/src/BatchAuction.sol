// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

contract BatchAuction {
    MockERC20 public immutable tokenA;
    MockERC20 public immutable tokenB;

    struct Intent {
        address trader;
        uint256 amountIn;
        bool isBuy; // true = selling A for B; false = selling B for A — naming kept simple on purpose
    }

    Intent[] public intents;
    bool public settled;

    event BatchSettled(
        uint256 clearingPriceNumerator,
        uint256 clearingPriceDenominator
    );

    constructor(address _tokenA, address _tokenB) {
        tokenA = MockERC20(_tokenA);
        tokenB = MockERC20(_tokenB);
    }

    function submitBuyIntent(uint256 amountIn) external {
        tokenA.transferFrom(msg.sender, address(this), amountIn);
        intents.push(
            Intent({trader: msg.sender, amountIn: amountIn, isBuy: true})
        );
    }

    function submitSellIntent(uint256 amountIn) external {
        tokenB.transferFrom(msg.sender, address(this), amountIn);
        intents.push(
            Intent({trader: msg.sender, amountIn: amountIn, isBuy: false})
        );
    }

    function settleBatch() external {
        require(!settled, "already settled");
        settled = true;

        uint256 totalBuyVolume; // total A being sold INTO the batch
        uint256 totalSellVolume; // total B being sold INTO the batch
        for (uint256 i = 0; i < intents.length; i++) {
            if (intents[i].isBuy) totalBuyVolume += intents[i].amountIn;
            else totalSellVolume += intents[i].amountIn;
        }

        // ONE clearing price for the ENTIRE batch — Concept 9's own real point.
        // Expressed as a ratio to avoid any rounding bias toward either side.
        emit BatchSettled(totalSellVolume, totalBuyVolume);

        for (uint256 i = 0; i < intents.length; i++) {
            Intent memory intent = intents[i];
            if (intent.isBuy) {
                uint256 amountOut = (intent.amountIn * totalSellVolume) /
                    totalBuyVolume;
                tokenB.transfer(intent.trader, amountOut);
            } else {
                uint256 amountOut = (intent.amountIn * totalBuyVolume) /
                    totalSellVolume;
                tokenA.transfer(intent.trader, amountOut);
            }
        }
    }
}
