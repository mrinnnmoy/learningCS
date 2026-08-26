// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {YulBasics} from "../src/YulBasics.sol";

contract YulBasicsTest is Test {
    YulBasics yulInstance;
    YulBasics solidityInstance;

    function setUp() public {
        // TWO separate, freshly-deployed instances — deliberately, not one shared counter.
        // Calling both increments on the SAME counter would confound the comparison: the FIRST
        // call always pays an expensive zero-to-nonzero SSTORE (~20,000 gas) while the SECOND
        // pays a much cheaper nonzero-to-nonzero one (~5,000 gas), regardless of which function
        // is called first — a storage-warmth artifact, not a Yul-vs-Solidity difference. Two
        // fresh instances mean BOTH increments pay the identical zero-to-nonzero cost, isolating
        // the actual variable this test is measuring.
        yulInstance = new YulBasics();
        solidityInstance = new YulBasics();
    }

    function testFix_YulAndSolidityIncrementCostNearlyIdenticalGas() public {
        uint256 gasBeforeYul = gasleft();
        yulInstance.incrementYul();
        uint256 yulGas = gasBeforeYul - gasleft();

        uint256 gasBeforeSolidity = gasleft();
        solidityInstance.incrementSolidity();
        uint256 solidityGas = gasBeforeSolidity - gasleft();

        console.log("incrementYul gas:", yulGas);
        console.log("incrementSolidity gas:", solidityGas);
        // Concept 5's own honest point — NOT asserting Yul is cheaper here, because it genuinely isn't,
        // meaningfully, for something this simple. A generous tolerance confirms they're CLOSE, not identical.
        assertApproxEqAbs(yulGas, solidityGas, 200);
    }

    function testFix_EfficientHashMatchesAbiEncodePacked() public view {
        bytes32 yulResult = yulInstance.efficientHash(42, 100);
        bytes32 solidityResult = keccak256(
            abi.encodePacked(uint256(42), uint256(100))
        );
        assertEq(yulResult, solidityResult);
    }
}
