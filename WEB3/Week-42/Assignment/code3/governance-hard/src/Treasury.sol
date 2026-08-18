// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Treasury {
    address public immutable timelock;

    error NotTimelock();

    constructor(address _timelock) {
        timelock = _timelock;
    }

    receive() external payable {}

    function release(address payable to, uint256 amount) external {
        if (msg.sender != timelock) revert NotTimelock();
        to.transfer(amount);
    }
}
