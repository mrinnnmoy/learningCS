// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract UnoptimizedVault {
    struct Deposit {
        uint256 amount; // slot 0
        uint256 timestamp; // slot 1
        bool active; // slot 2 — wastes 31 of its own 32 bytes
    }

    mapping(address => Deposit) public deposits;
    address[] public depositors;

    function deposit() external payable {
        require(msg.value > 0, "deposit amount must be greater than zero");
        if (!deposits[msg.sender].active) {
            depositors.push(msg.sender);
        }
        deposits[msg.sender].amount += msg.value;
        deposits[msg.sender].timestamp = block.timestamp;
        deposits[msg.sender].active = true;
    }

    function totalDeposited() external view returns (uint256 total) {
        for (uint256 i = 0; i < depositors.length; i++) {
            total += deposits[depositors[i]].amount;
        }
    }

    function withdraw(uint256 amount) external {
        require(
            deposits[msg.sender].active,
            "no active deposit found for this address"
        );
        require(
            deposits[msg.sender].amount >= amount,
            "withdrawal amount exceeds deposited balance"
        );
        deposits[msg.sender].amount -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "withdrawal transfer failed");
    }

    function batchCheckActive(
        address[] memory users
    ) external view returns (bool[] memory results) {
        results = new bool[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            results[i] = deposits[users[i]].active;
        }
    }
}
