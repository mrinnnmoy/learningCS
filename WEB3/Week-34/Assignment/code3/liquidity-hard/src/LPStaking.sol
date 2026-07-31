// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// SIMPLIFIED yield farming (Concept 8) — each staker independently earns staked * rate * elapsed,
// UNCAPPED in total. A real farm (the "MasterChef" pattern) instead shares one FIXED reward rate
// proportionally across every staker via an accRewardPerShare accumulator, so total emissions stay
// fixed regardless of staker count. This version is genuinely correct for demonstrating the
// stake/accrue/claim/unstake MECHANISM, not a production-ready reward-budget design — noted here
// directly, not just in the README, so this file stays honest on its own if copied elsewhere.
contract LPStaking {
    IERC20Minimal public immutable lpToken;
    IERC20Minimal public immutable rewardToken;
    uint256 public immutable rewardRatePerSecond; // reward units per staked unit per second, 1e18-scaled

    mapping(address => uint256) public staked;
    mapping(address => uint256) public lastUpdateTime;

    constructor(
        address _lpToken,
        address _rewardToken,
        uint256 _rewardRatePerSecond
    ) {
        lpToken = IERC20Minimal(_lpToken);
        rewardToken = IERC20Minimal(_rewardToken);
        rewardRatePerSecond = _rewardRatePerSecond;
    }

    function stake(uint256 amount) external {
        _claim(msg.sender);
        lpToken.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender] += amount;
        lastUpdateTime[msg.sender] = block.timestamp;
    }

    function unstake(uint256 amount) external {
        _claim(msg.sender);
        staked[msg.sender] -= amount;
        lpToken.transfer(msg.sender, amount);
        lastUpdateTime[msg.sender] = block.timestamp;
    }

    function claim() external {
        _claim(msg.sender);
    }

    function pendingReward(address user) public view returns (uint256) {
        uint256 elapsed = block.timestamp - lastUpdateTime[user];
        return (staked[user] * rewardRatePerSecond * elapsed) / 1e18;
    }

    function _claim(address user) internal {
        uint256 reward = pendingReward(user);
        lastUpdateTime[user] = block.timestamp;
        if (reward > 0) {
            rewardToken.transfer(user, reward);
        }
    }
}
