// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {SimpleMultisig} from "../src/SimpleMultisig.sol";

contract DeployMultisig is Script {
    function run() external returns (SimpleMultisig multisig) {
        address[] memory owners = new address[](3);
        owners[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // anvil Account 0
        owners[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // anvil Account 1
        owners[2] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // anvil Account 2

        vm.startBroadcast();
        multisig = new SimpleMultisig(owners, 2); // 2-of-3
        (bool ok, ) = address(multisig).call{value: 10 ether}("");
        require(ok, "funding failed");
        vm.stopBroadcast();

        console.log("SimpleMultisig deployed at:", address(multisig));
    }
}
