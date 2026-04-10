#include <iostream>
#include <vector>
#include <climits>
using namespace std;

// ── Part 1: Climbing Stairs ───────────────────
int climbStairs(int n)
{
    if (n <= 2)
        return n;
    vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++)
        dp[i] = dp[i - 1] + dp[i - 2];

    cout << "Stairs dp: ";
    for (int i = 1; i <= n; i++)
        cout << dp[i] << " ";
    cout << "\n";
    return dp[n];
}

// ── Part 2: House Robber ──────────────────────
int rob(vector<int> &nums)
{
    int n = nums.size();
    if (n == 1)
        return nums[0];
    vector<int> dp(n);
    dp[0] = nums[0];
    dp[1] = max(nums[0], nums[1]);
    for (int i = 2; i < n; i++)
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);

    cout << "Robber dp: ";
    for (int x : dp)
        cout << x << " ";
    cout << "\n";
    return dp[n - 1];
}

// ── Part 3: Coin Change ───────────────────────
int coinChange(vector<int> &coins, int amount)
{
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != INT_MAX)
                dp[i] = min(dp[i], dp[i - c] + 1);

    cout << "Coins dp : ";
    for (int i = 0; i <= amount; i++)
        cout << (dp[i] == INT_MAX ? -1 : dp[i]) << " ";
    cout << "\n";
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}

// ── Part 4: Max Subarray ──────────────────────
int maxSubArray(vector<int> &nums)
{
    int n = nums.size();
    int maxSum = nums[0];
    int currSum = nums[0];
    vector<int> dp(n);
    dp[0] = nums[0];

    for (int i = 1; i < n; i++)
    {
        dp[i] = max(nums[i], dp[i - 1] + nums[i]);
        maxSum = max(maxSum, dp[i]);
    }

    cout << "Subarray dp: ";
    for (int x : dp)
        cout << x << " ";
    cout << "\n";
    return maxSum;
}

int main()
{
    // Part 1
    cout << "=== Part 1: Climbing Stairs ===\n";
    cout << "n=5  → " << climbStairs(5) << " ways\n";
    cout << "n=10 → " << climbStairs(10) << " ways\n\n";

    // Part 2
    cout << "=== Part 2: House Robber ===\n";
    vector<int> h1 = {2, 7, 9, 3, 1};
    vector<int> h2 = {2, 1, 1, 2};
    cout << "[2,7,9,3,1] → " << rob(h1) << "\n";
    cout << "[2,1,1,2]   → " << rob(h2) << "\n\n";

    // Part 3
    cout << "=== Part 3: Coin Change ===\n";
    vector<int> c1 = {1, 5, 6, 9};
    vector<int> c2 = {2};
    cout << "coins=[1,5,6,9] amount=11 → " << coinChange(c1, 11) << "\n";
    cout << "coins=[2]       amount=3  → " << coinChange(c2, 3) << "\n\n";

    // Part 4
    cout << "=== Part 4: Max Subarray ===\n";
    vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "[-2,1,-3,4,-1,2,1,-5,4] → " << maxSubArray(a) << "\n";

    return 0;
}