// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract OptimizedVault {
    struct Deposit {
        uint128 amount; // slot 0, bytes 0-15
        uint64 timestamp; // slot 0, bytes 16-23
        bool active; // slot 0, byte 24 — all THREE fields, ONE slot (Concept 2)
    }

    mapping(address => Deposit) public deposits;
    address[] public depositors;

    error ZeroDeposit();
    error NoActiveDeposit();
    error InsufficientBalance();
    error TransferFailed();

    function deposit() external payable {
        if (msg.value == 0) revert ZeroDeposit(); // Concept 3

        Deposit storage d = deposits[msg.sender]; // ONE storage pointer, reused below (Concept 7)
        if (!d.active) {
            depositors.push(msg.sender);
            d.active = true;
        }
        d.amount += uint128(msg.value);
        d.timestamp = uint64(block.timestamp);
    }

    function totalDeposited() external view returns (uint256 total) {
        uint256 length = depositors.length; // Concept 7 — cached once
        for (uint256 i = 0; i < length; ) {
            total += deposits[depositors[i]].amount;
            unchecked {
                ++i;
            } // Concept 4
        }
    }

    function withdraw(uint256 amount) external {
        Deposit storage d = deposits[msg.sender];
        if (!d.active) revert NoActiveDeposit();
        if (d.amount < amount) revert InsufficientBalance();
        d.amount -= uint128(amount);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    function batchCheckActive(
        address[] calldata users
    ) external view returns (bool[] memory results) {
        uint256 length = users.length; // Concept 7
        results = new bool[](length);
        for (uint256 i = 0; i < length; ) {
            results[i] = deposits[users[i]].active;
            unchecked {
                ++i;
            }
        }
    }
}
