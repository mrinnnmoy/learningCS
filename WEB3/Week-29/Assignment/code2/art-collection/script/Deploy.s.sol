// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {ArtCollection} from "../src/ArtCollection.sol";

contract DeployArtCollection is Script {
    function run() external returns (ArtCollection collection) {
        vm.startBroadcast();
        collection = new ArtCollection(msg.sender);
        vm.stopBroadcast();

        console.log("ArtCollection deployed at:", address(collection));
    }
}
