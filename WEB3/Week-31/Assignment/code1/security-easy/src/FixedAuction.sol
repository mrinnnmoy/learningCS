// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract FixedAuction {
    address public highestBidder;
    uint256 public highestBid;
    mapping(address => uint256) public pendingReturns;

    function bid() external payable {
        require(msg.value > highestBid, "bid too low");

        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;   // credited, not pushed — pull over push (Concept 7)
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdrawRefund() external {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "nothing to withdraw");
        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}