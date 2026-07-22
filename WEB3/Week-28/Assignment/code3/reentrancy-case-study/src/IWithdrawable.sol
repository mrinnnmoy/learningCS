// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

interface IWithdrawable {
    function deposit() external payable;
    function withdraw() external;
}