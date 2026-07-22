// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ILogger} from "./ILogger.sol";

contract PaymentSplitter {
    address[] public payees;
    ILogger public immutable logger;

    error NoPayees();
    error ETHTransferFailed(address payee);
    error StaticCallFailed();

    event Split(uint256 totalAmount, uint256 perPayee);

    constructor(address[] memory _payees, address loggerAddress) {
        if (_payees.length == 0) revert NoPayees();
        payees = _payees;
        logger = ILogger(loggerAddress);
    }

    function split() external payable {
        uint256 share = msg.value / payees.length;
        for (uint256 i = 0; i < payees.length; i++) {
            (bool ok, ) = payees[i].call{value: share}("");   // raw low-level call (Concept 6)
            if (!ok) revert ETHTransferFailed(payees[i]);
        }

        logger.log("split executed");                          // typed interface CCI (Concept 10)
        emit Split(msg.value, share);
    }

    function peek(address target, bytes calldata data) external view returns (bytes memory) {
        (bool ok, bytes memory result) = target.staticcall(data);   // Concept 6: read-only probe
        if (!ok) revert StaticCallFailed();
        return result;
    }

    function payeeCount() external view returns (uint256) {
        return payees.length;
    }
}