// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

contract LockBox {
    MockERC20 public immutable token;
    address public immutable relayer;
    uint256 public nonce;

    error NotRelayer();

    event Locked(
        address indexed user,
        uint256 amount,
        uint256 indexed nonce,
        uint256 sourceChainId
    );
    event Unlocked(address indexed user, uint256 amount);

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert NotRelayer();
        _;
    }

    constructor(address _token, address _relayer) {
        token = MockERC20(_token);
        relayer = _relayer;
    }

    function lock(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        emit Locked(msg.sender, amount, nonce, block.chainid); // Concept 2 — Chain A's own real chain ID
        nonce++;
    }

    function unlock(address user, uint256 amount) external onlyRelayer {
        token.transfer(user, amount);
        emit Unlocked(user, amount);
    }
}
