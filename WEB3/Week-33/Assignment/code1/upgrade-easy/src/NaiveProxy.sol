// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// Deliberately naive — Week 28's exact shape, reintroduced on purpose. Never ship this.
contract NaiveProxy {
    address public implementation;   // slot 0 — the SAME slot NaiveImplementation's own `owner` occupies

    constructor(address _implementation) {
        implementation = _implementation;
    }

    fallback() external payable {
        address impl = implementation;
        (bool ok, bytes memory result) = impl.delegatecall(msg.data);
        require(ok, string(result));
        assembly {
            return(add(result, 32), mload(result))
        }
    }
}