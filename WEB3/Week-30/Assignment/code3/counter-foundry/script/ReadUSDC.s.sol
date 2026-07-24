// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";

interface IERC20Minimal {
    function totalSupply() external view returns (uint256);
}

contract ReadUSDC is Script {
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    function run() external view {
        uint256 supply = IERC20Minimal(USDC).totalSupply();
        console.log(
            "Real USDC totalSupply, read via a local mainnet fork:",
            supply
        );
    }
}
