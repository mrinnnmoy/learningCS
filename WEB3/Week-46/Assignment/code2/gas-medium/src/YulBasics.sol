// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract YulBasics {
    uint256 public counter;

    function incrementYul() external {
        assembly {
            sstore(counter.slot, add(sload(counter.slot), 1))
        }
    }

    function incrementSolidity() external {
        counter += 1;
    }

    function efficientHash(
        uint256 a,
        uint256 b
    ) external pure returns (bytes32 result) {
        assembly {
            let ptr := mload(0x40) // the free memory pointer
            mstore(ptr, a)
            mstore(add(ptr, 0x20), b)
            result := keccak256(ptr, 0x40) // hash both 32-byte words directly, no separate encode step
        }
    }
}
