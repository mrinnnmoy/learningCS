// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedToken is ERC20 {
    address public immutable relayer;

    error NotRelayer();

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert NotRelayer();
        _;
    }

    constructor(address _relayer) ERC20("Wrapped Token", "wTOKEN") {
        relayer = _relayer;
    }

    function mint(address to, uint256 amount) external onlyRelayer {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount); // caller-initiated — anyone can burn their OWN wrapped balance
    }
}
