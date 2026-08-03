// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {GameToken} from "../src/GameToken.sol";

contract DeployGameToken is Script {
    function run() external returns (GameToken token) {
        vm.startBroadcast();
        token = new GameToken(msg.sender);
        vm.stopBroadcast();

        console.log("GameToken deployed at:", address(token));
    }
}
