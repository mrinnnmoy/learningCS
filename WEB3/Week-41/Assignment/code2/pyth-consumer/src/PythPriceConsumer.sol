// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PythPriceConsumer {
    IPyth public immutable pyth;
    bytes32 public immutable priceId;

    event PriceUpdated(
        int64 price,
        uint64 conf,
        int32 expo,
        uint256 publishTime
    );

    constructor(address _pyth, bytes32 _priceId) {
        pyth = IPyth(_pyth);
        priceId = _priceId;
    }

    function updateAndGetPrice(
        bytes[] calldata priceUpdateData
    ) external payable returns (int64 price, uint64 conf) {
        uint256 fee = pyth.getUpdateFee(priceUpdateData); // Concept 3 — the pull model's own real cost
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);

        PythStructs.Price memory result = pyth.getPriceNoOlderThan(priceId, 60); // Concept 6 — enforced BY the call itself
        emit PriceUpdated(
            result.price,
            result.conf,
            result.expo,
            result.publishTime
        );

        return (result.price, result.conf); // Concept 8 — the confidence interval, not just a point estimate
    }
}
