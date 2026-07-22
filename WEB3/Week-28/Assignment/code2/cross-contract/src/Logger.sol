// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Logger {
    event Logged(address indexed from, string note);

    function log(string calldata note) external {
        emit Logged(msg.sender, note);
    }
}