// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {WrappedToken} from "../src/WrappedToken.sol";

contract DeployChainB is Script {
    function run(address sourceLockBox) external {
        vm.startBroadcast();
        // 31337 — anvil's own default Chain A chain ID, confirmed via the Tutorial's own sanity script
        WrappedToken wrappedToken = new WrappedToken(
            msg.sender,
            31337,
            sourceLockBox
        );
        vm.stopBroadcast();

        console.log("Chain B chainid:", block.chainid);
        console.log("WrappedToken deployed at:", address(wrappedToken));
    }
}
