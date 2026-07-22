// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Delegator {
    uint256 public lastResult;   // storage slot 0 — deliberately matches MathLib, on purpose (Concept 6)

    error DelegatecallFailed();

    function multiplyViaDelegatecall(address mathLib, uint256 a, uint256 b) external returns (uint256) {
        (bool ok, bytes memory result) = mathLib.delegatecall(
            abi.encodeWithSignature("multiply(uint256,uint256)", a, b)
        );
        if (!ok) revert DelegatecallFailed();
        return abi.decode(result, (uint256));
    }
}