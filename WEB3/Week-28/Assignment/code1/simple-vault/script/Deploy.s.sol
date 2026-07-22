// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {SimpleVault} from "../src/SimpleVault.sol";

contract DeploySimpleVault is Script {
    function run() external returns (SimpleVault vault) {
        vm.startBroadcast();
        vault = new SimpleVault();
        vm.stopBroadcast();

        console.log("SimpleVault deployed at:", address(vault));
    }
}
