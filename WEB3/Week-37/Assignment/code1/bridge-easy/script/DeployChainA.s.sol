// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LockBox} from "../src/LockBox.sol";

contract DeployChainA is Script {
    function run() external {
        vm.startBroadcast();
        MockERC20 token = new MockERC20("Real Token", "REAL");
        LockBox lockBox = new LockBox(address(token), msg.sender); // the deployer's OWN address acts as relayer
        token.mint(msg.sender, 1000 ether);
        vm.stopBroadcast();

        console.log("Chain A chainid:", block.chainid);
        console.log("MockERC20 deployed at:", address(token));
        console.log("LockBox deployed at:", address(lockBox));
    }
}
