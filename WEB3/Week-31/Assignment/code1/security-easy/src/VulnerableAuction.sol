// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// VULNERABLE ON PURPOSE — push-payment DoS (Concept 7). Never ship this.
contract VulnerableAuction {
    address public highestBidder;
    uint256 public highestBid;

    function bid() external payable {
        require(msg.value > highestBid, "bid too low");

        if (highestBidder != address(0)) {
            // Pushing a refund inline — if this recipient's receive() reverts, EVERY future bid() call reverts too.
            payable(highestBidder).transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}