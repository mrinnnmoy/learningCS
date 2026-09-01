// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {GoodVault} from "../src/GoodVault.sol";

contract DeployGoodVault is Script {
    function run() external returns (MockERC20 token, GoodVault vault) {
        vm.startBroadcast();

        token = new MockERC20("Mock Token", "MOCK");
        vault = new GoodVault(address(token), msg.sender);

        vm.stopBroadcast();

        console.log("MockERC20 deployed at:", address(token));
        console.log("GoodVault deployed at:", address(vault));
        console.log("GoodVault owner:", vault.owner());
    }
}
