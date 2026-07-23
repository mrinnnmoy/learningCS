// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {LiveArtCollection} from "../src/LiveArtCollection.sol";

contract DeployLiveArtCollection is Script {
    function run() external returns (LiveArtCollection collection) {
        vm.startBroadcast();
        collection = new LiveArtCollection(msg.sender);
        vm.stopBroadcast();

        console.log("LiveArtCollection deployed at:", address(collection));
        console.log("Deployed in block:", block.number);
        console.log("Save both, comma-separated, into deployments/sepolia.txt");
    }
}
