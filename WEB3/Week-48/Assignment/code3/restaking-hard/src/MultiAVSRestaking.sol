// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract MultiAVSRestaking {
    mapping(address => uint256) public restaked;
    mapping(address => mapping(bytes32 => bool)) public optedIntoAVS;
    mapping(bytes32 => address) public avsSlasher;
    mapping(bytes32 => uint256) public avsMaxSlashBps;

    error NotSlasher();
    error NotOptedIn();

    event Slashed(
        address indexed restaker,
        bytes32 indexed avsId,
        uint256 amountSlashed,
        uint256 remainingStake
    );

    function registerAVS(
        bytes32 avsId,
        address slasher,
        uint256 maxSlashBps
    ) external {
        avsSlasher[avsId] = slasher;
        avsMaxSlashBps[avsId] = maxSlashBps;
    }

    function restake() external payable {
        restaked[msg.sender] += msg.value;
    }

    function optIntoAVS(bytes32 avsId) external {
        optedIntoAVS[msg.sender][avsId] = true; // the SAME underlying stake now backs THIS AVS too (Concept 1)
    }

    function slash(
        address restaker,
        bytes32 avsId
    ) external returns (uint256 amountSlashed) {
        if (msg.sender != avsSlasher[avsId]) revert NotSlasher();
        if (!optedIntoAVS[restaker][avsId]) revert NotOptedIn();

        uint256 currentStake = restaked[restaker]; // Concept 5 — reads whatever ACTUALLY remains right now
        amountSlashed = (currentStake * avsMaxSlashBps[avsId]) / 10000;
        restaked[restaker] -= amountSlashed;

        emit Slashed(restaker, avsId, amountSlashed, restaked[restaker]);
    }
}
