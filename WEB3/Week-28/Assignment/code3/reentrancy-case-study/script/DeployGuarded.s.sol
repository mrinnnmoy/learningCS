// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {GuardedVault} from "../src/GuardedVault.sol";
import {ReentrancyAttacker} from "../src/ReentrancyAttacker.sol";

contract DeployGuarded is Script {
    function run() external {
        vm.startBroadcast();
        GuardedVault vault = new GuardedVault();
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(vault));
        vm.stopBroadcast();

        console.log("GuardedVault deployed at:", address(vault));
        console.log("ReentrancyAttacker (vs. guarded) deployed at:", address(attacker));
    }
}