// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract RestakingManager {
    mapping(address => uint256) public restaked;
    mapping(address => mapping(bytes32 => bool)) public optedIntoAVS;
    mapping(bytes32 => address) public avsSlasher;

    error NotSlasher();
    error NotOptedIn();
    error InsufficientStake();
    error WithdrawFailed();

    event Restaked(address indexed restaker, uint256 amount);
    event OptedIn(address indexed restaker, bytes32 indexed avsId);
    event Slashed(
        address indexed restaker,
        bytes32 indexed avsId,
        uint256 amount
    );

    function registerAVS(bytes32 avsId, address slasher) external {
        avsSlasher[avsId] = slasher;
    }

    function restake() external payable {
        restaked[msg.sender] += msg.value;
        emit Restaked(msg.sender, msg.value);
    }

    function optIntoAVS(bytes32 avsId) external {
        optedIntoAVS[msg.sender][avsId] = true;
        emit OptedIn(msg.sender, avsId);
    }

    function slash(address restaker, bytes32 avsId, uint256 amount) external {
        if (msg.sender != avsSlasher[avsId]) revert NotSlasher(); // Concept 3 — ONLY that AVS's own slasher
        if (!optedIntoAVS[restaker][avsId]) revert NotOptedIn(); // ONLY a restaker who opted in
        if (restaked[restaker] < amount) revert InsufficientStake();

        restaked[restaker] -= amount;
        emit Slashed(restaker, avsId, amount);
    }

    function withdraw(uint256 amount) external {
        if (restaked[msg.sender] < amount) revert InsufficientStake();
        restaked[msg.sender] -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }
}
