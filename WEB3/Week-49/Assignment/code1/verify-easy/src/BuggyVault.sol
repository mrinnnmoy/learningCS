// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract BuggyVault {
    mapping(address => uint256) public balances;

    error WithdrawFailed();

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE ON PURPOSE — an off-by-one: allows withdrawing ONE WEI MORE than the real
    // balance under unsigned-integer wraparound protection alone (Week 27, Concept 10's own
    // checked arithmetic still reverts on the underflow — but only AFTER already passing this
    // broken check, wasting gas on a doomed call rather than failing cleanly and immediately).
    function withdraw(uint256 amount) external {
        if (amount > balances[msg.sender] + 1) revert(); // BUG — should be `amount > balances[msg.sender]`
        balances[msg.sender] -= amount; // underflows and reverts here if amount was genuinely too large — LATE

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }
}
