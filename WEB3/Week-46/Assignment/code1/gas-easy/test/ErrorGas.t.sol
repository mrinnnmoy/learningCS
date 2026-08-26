// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {RequireStringDemo} from "../src/RequireStringDemo.sol";
import {CustomErrorDemo} from "../src/CustomErrorDemo.sol";

contract ErrorGasTest is Test {
    function testFix_CustomErrorsCostLessThanRequireStrings() public {
        uint256 gasBeforeRequire = gasleft();
        RequireStringDemo requireDemo = new RequireStringDemo();
        uint256 requireDeployGas = gasBeforeRequire - gasleft();

        uint256 gasBeforeCustom = gasleft();
        CustomErrorDemo customDemo = new CustomErrorDemo();
        uint256 customDeployGas = gasBeforeCustom - gasleft();

        console.log("RequireStringDemo deployment gas:", requireDeployGas);
        console.log("CustomErrorDemo deployment gas:", customDeployGas);
        assertLt(customDeployGas, requireDeployGas); // Concept 3 — less bytecode to deploy

        vm.expectRevert(
            "value must be greater than zero, this is a long descriptive error message"
        );
        requireDemo.setValue(0);

        vm.expectRevert(CustomErrorDemo.ValueTooLow.selector);
        customDemo.setValue(0);
    }
}
