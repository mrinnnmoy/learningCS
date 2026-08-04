// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NativeToken is ERC20 {
    address public immutable bridge;

    error NotBridge();

    modifier onlyBridge() {
        if (msg.sender != bridge) revert NotBridge();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _bridge
    ) ERC20(name, symbol) {
        bridge = _bridge;
    }

    function mint(address to, uint256 amount) external onlyBridge {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyBridge {
        _burn(from, amount);
    }
}
