// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

interface IFlashLoanReceiver {
    function onFlashLoan(uint256 amount, bytes calldata data) external;
}

contract FlashLoanProvider {
    MockERC20 public immutable token;

    error RepaymentFailed();

    constructor(address _token) {
        token = MockERC20(_token);
    }

    function flashLoan(uint256 amount, address borrower, bytes calldata data) external {
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transfer(borrower, amount);

        IFlashLoanReceiver(borrower).onFlashLoan(amount, data);

        if (token.balanceOf(address(this)) < balanceBefore) revert RepaymentFailed();
    }
}