// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {TaskRegistry} from "../src/TaskRegistry.sol";

contract DeployTaskRegistry is Script {
    function run() external returns (TaskRegistry registry) {
        vm.startBroadcast();

        registry = new TaskRegistry();

        vm.stopBroadcast();

        console.log("TaskRegistry deployed at:", address(registry));
        console.log("Save this address into deployments/sepolia.txt");
    }
}
