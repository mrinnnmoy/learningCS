// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract DeployCounter is Script {
    function run() external returns (Counter counter) {
        vm.startBroadcast();
        counter = new Counter();
        vm.stopBroadcast();

        console.log("Counter deployed on chain ID:", block.chainid); // 84532 — confirming this IS Base Sepolia
        console.log("Counter deployed at:", address(counter));
    }
}
