// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract CommitRevealGuess {
    uint256 private immutable secretNumber;
    mapping(address => bytes32) public commitments;
    bool public revealsOpen;

    error AlreadyCommitted();
    error RevealsNotOpen();
    error NoCommitment();
    error WrongAnswer();

    constructor(uint256 _secretNumber) payable {
        secretNumber = _secretNumber;
    }

    function commit(bytes32 hashedGuess) external {
        if (commitments[msg.sender] != bytes32(0)) revert AlreadyCommitted();
        commitments[msg.sender] = hashedGuess;
    }

    function openReveals() external {
        revealsOpen = true;
    }

    function reveal(uint256 guess, bytes32 salt) external {
        if (!revealsOpen) revert RevealsNotOpen();
        bytes32 commitment = commitments[msg.sender];
        if (commitment == bytes32(0)) revert NoCommitment();

        bytes32 expected = keccak256(abi.encodePacked(guess, salt, msg.sender));
        if (expected != commitment) revert WrongAnswer();

        commitments[msg.sender] = bytes32(0);
        if (guess == secretNumber) {
            payable(msg.sender).transfer(address(this).balance);
        }
    }
}