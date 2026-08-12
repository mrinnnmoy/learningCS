// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BlacklistToken is ERC20, Ownable {
    mapping(address => bool) public isBlacklisted;

    error Blacklisted(address account);

    constructor(
        address initialOwner
    ) ERC20("Compliance Token", "CMPL") Ownable(initialOwner) {}

    function setBlacklisted(address account, bool status) external onlyOwner {
        isBlacklisted[account] = status;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (isBlacklisted[from]) revert Blacklisted(from);
        if (isBlacklisted[to]) revert Blacklisted(to);
        super._update(from, to, value);
    }
}
