// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LiquidRestakingToken is ERC20 {
    mapping(bytes32 => address) public avsSlasher;
    uint256 public totalRestaked;

    error NotSlasher();
    error InsufficientStake();
    error RedeemFailed();

    constructor() ERC20("Liquid Restaked ETH", "LRETH") {}

    receive() external payable {}

    function registerAVS(bytes32 avsId, address slasher) external {
        avsSlasher[avsId] = slasher;
    }

    function deposit() external payable returns (uint256 shares) {
        if (totalSupply() == 0) {
            shares = msg.value; // 1:1 for the very first depositor
        } else {
            shares = (msg.value * totalSupply()) / totalRestaked; // Concept 4's own exchange-rate formula
        }
        totalRestaked += msg.value;
        _mint(msg.sender, shares);
    }

    function redeem(uint256 shares) external returns (uint256 amount) {
        amount = (shares * totalRestaked) / totalSupply(); // the SAME formula, whether the rate rose or fell
        _burn(msg.sender, shares);
        totalRestaked -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert RedeemFailed();
    }

    function slash(bytes32 avsId, uint256 amount) external {
        if (msg.sender != avsSlasher[avsId]) revert NotSlasher();
        if (amount > totalRestaked) revert InsufficientStake();
        totalRestaked -= amount; // Concept 4, 5 — supply UNCHANGED, every existing share now worth LESS
    }
}
