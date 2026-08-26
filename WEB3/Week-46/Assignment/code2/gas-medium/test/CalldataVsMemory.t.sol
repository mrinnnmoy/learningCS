// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {CalldataVsMemory} from "../src/CalldataVsMemory.sol";

contract CalldataVsMemoryTest is Test {
    CalldataVsMemory demo;
    uint256[] values;

    function setUp() public {
        demo = new CalldataVsMemory();
        for (uint256 i = 0; i < 100; i++) {
            values.push(i);
        }
    }

    function testFix_CalldataCostsLessThanMemoryForReadOnlyArrays() public {
        uint256 gasBeforeMemory = gasleft();
        demo.sumMemory(values);
        uint256 memoryGas = gasBeforeMemory - gasleft();

        uint256 gasBeforeCalldata = gasleft();
        demo.sumCalldata(values);
        uint256 calldataGas = gasBeforeCalldata - gasleft();

        console.log("sumMemory gas (100 elements):", memoryGas);
        console.log("sumCalldata gas (100 elements):", calldataGas);
        assertLt(calldataGas, memoryGas); // Concept 1, 7 — no copy needed for calldata
    }
}
