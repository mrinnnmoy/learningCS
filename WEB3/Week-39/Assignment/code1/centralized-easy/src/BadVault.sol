// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {MockERC20} from "./MockERC20.sol";

// THE CONTRAST CASE — withdraw() is whenNotPaused, deliberately, trapping user funds during a
// pause (Concept 2). Never ship this shape for a user's own exit path.
contract BadVault is Ownable, Pausable {
    MockERC20 public immutable token;
    mapping(address => bool) public whitelisted;
    mapping(address => uint256) public balances;

    error NotWhitelisted();

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = MockERC20(_token);
    }

    function setWhitelisted(address user, bool status) external onlyOwner {
        whitelisted[user] = status;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function deposit(uint256 amount) external whenNotPaused {
        if (!whitelisted[msg.sender]) revert NotWhitelisted();
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function withdraw() external whenNotPaused {
        // THE BUG — blocks even the user's own exit
        uint256 amount = balances[msg.sender];
        require(amount > 0, "nothing to withdraw");
        balances[msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }
}
