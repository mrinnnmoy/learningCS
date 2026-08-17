// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import {PythPriceConsumer} from "../src/PythPriceConsumer.sol";

contract PythPriceConsumerTest is Test {
    MockPyth mockPyth;
    PythPriceConsumer consumer;
    bytes32 constant ETH_USD_ID =
        0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

    function setUp() public {
        mockPyth = new MockPyth(60, 1); // validTimePeriod=60s, singleUpdateFeeInWei=1
        consumer = new PythPriceConsumer(address(mockPyth), ETH_USD_ID);
    }

    function testFix_UpdateAndReadReturnsPriceAndConfidence() public {
        bytes[] memory updateData = new bytes[](1);
        updateData[0] = mockPyth.createPriceFeedUpdateData(
            ETH_USD_ID,
            2000_00000000,
            5_00000000,
            -8,
            2000_00000000,
            5_00000000,
            uint64(block.timestamp)
        );

        uint256 fee = mockPyth.getUpdateFee(updateData);
        (int64 price, uint64 conf) = consumer.updateAndGetPrice{value: fee}(
            updateData
        );

        assertEq(price, 2000_00000000); // $2000, at Pyth's own -8 exponent convention
        assertEq(conf, 5_00000000); // Concept 8's own confidence interval, genuinely read and returned
    }
}
