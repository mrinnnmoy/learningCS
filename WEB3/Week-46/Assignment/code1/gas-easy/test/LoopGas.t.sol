// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {LoopGasDemo} from "../src/LoopGasDemo.sol";

contract LoopGasTest is Test {
    LoopGasDemo demo;
    uint256[] values;

    function setUp() public {
        demo = new LoopGasDemo();
        for (uint256 i = 0; i < 100; i++) {
            values.push(i);
        }
    }

    function testFix_UncheckedLoopCostsLessThanCheckedLoop() public {
        uint256 gasBeforeChecked = gasleft();
        demo.sumChecked(values);
        uint256 checkedGas = gasBeforeChecked - gasleft();

        uint256 gasBeforeUnchecked = gasleft();
        demo.sumUnchecked(values);
        uint256 uncheckedGas = gasBeforeUnchecked - gasleft();

        console.log("sumChecked gas (100 elements):", checkedGas);
        console.log("sumUnchecked gas (100 elements):", uncheckedGas);
        assertLt(uncheckedGas, checkedGas);
    }
}
