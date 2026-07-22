// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {Logger} from "../src/Logger.sol";
import {PaymentSplitter} from "../src/PaymentSplitter.sol";
import {MathLib} from "../src/MathLib.sol";
import {Delegator} from "../src/Delegator.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        Logger logger = new Logger();

        address[] memory payees = new address[](2);
        payees[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // anvil Account 1
        payees[1] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // anvil Account 2
        PaymentSplitter splitter = new PaymentSplitter(payees, address(logger));

        MathLib mathLib = new MathLib();
        Delegator delegator = new Delegator();

        vm.stopBroadcast();

        console.log("Logger deployed at:", address(logger));
        console.log("PaymentSplitter deployed at:", address(splitter));
        console.log("MathLib deployed at:", address(mathLib));
        console.log("Delegator deployed at:", address(delegator));
    }
}
