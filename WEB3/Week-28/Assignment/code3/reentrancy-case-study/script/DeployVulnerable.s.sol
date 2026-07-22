// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {VulnerableVault} from "../src/VulnerableVault.sol";
import {ReentrancyAttacker} from "../src/ReentrancyAttacker.sol";

contract DeployVulnerable is Script {
    function run() external {
        vm.startBroadcast();
        VulnerableVault vault = new VulnerableVault();
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(vault));
        vm.stopBroadcast();

        console.log("VulnerableVault deployed at:", address(vault));
        console.log("ReentrancyAttacker deployed at:", address(attacker));
    }
}