// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {PriceConsumer} from "../src/PriceConsumer.sol";

contract DeployPriceConsumer is Script {
    address constant SEPOLIA_ETH_USD_FEED =
        0x694AA1769357215DE4FAC081bf1f309aDC325306;

    function run() external returns (PriceConsumer consumer) {
        vm.startBroadcast();
        consumer = new PriceConsumer(SEPOLIA_ETH_USD_FEED);
        vm.stopBroadcast();

        console.log("PriceConsumer deployed at:", address(consumer));
        console.log(
            "Live ETH/USD price (18 decimals):",
            consumer.getLatestPrice()
        );
    }
}
