#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// ── Part 1: 0/1 Knapsack ─────────────────────
int knapsack(vector<int> &w, vector<int> &v, int W)
{
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++)
        for (int wt = 0; wt <= W; wt++)
        {
            dp[i][wt] = dp[i - 1][wt];
            if (w[i - 1] <= wt)
                dp[i][wt] = max(dp[i][wt],
                                dp[i - 1][wt - w[i - 1]] + v[i - 1]);
        }

    cout << "Knapsack DP table:\n";
    cout << "     ";
    for (int wt = 0; wt <= W; wt++)
        cout << wt << "  ";
    cout << "\n";
    for (int i = 0; i <= n; i++)
    {
        cout << "i=" << i << " : ";
        for (int wt = 0; wt <= W; wt++)
            cout << dp[i][wt] << "  ";
        cout << "\n";
    }
    return dp[n][W];
}

// ── Part 2: LCS ───────────────────────────────
pair<int, string> LCS(string &s1, string &s2)
{
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
        {
            if (s1[i - 1] == s2[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }

    // Reconstruct LCS string
    string lcs = "";
    int i = m, j = n;
    while (i > 0 && j > 0)
    {
        if (s1[i - 1] == s2[j - 1])
        {
            lcs = s1[i - 1] + lcs;
            i--;
            j--;
        }
        else if (dp[i - 1][j] > dp[i][j - 1])
            i--;
        else
            j--;
    }

    cout << "\nLCS DP table:\n";
    cout << "    ";
    for (char c : s2)
        cout << " " << c;
    cout << "\n  ";
    for (int jj = 0; jj <= n; jj++)
        cout << dp[0][jj] << " ";
    cout << "\n";
    for (int ii = 1; ii <= m; ii++)
    {
        cout << s1[ii - 1] << " ";
        for (int jj = 0; jj <= n; jj++)
            cout << dp[ii][jj] << " ";
        cout << "\n";
    }

    return {dp[m][n], lcs};
}

// ── Part 3: LIS ───────────────────────────────
pair<int, vector<int>> LIS(vector<int> &nums)
{
    int n = nums.size();
    vector<int> dp(n, 1);
    vector<int> parent(n, -1);

    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i])
            {
                dp[i] = dp[j] + 1;
                parent[i] = j;
            }

    cout << "\nLIS dp array: ";
    for (int x : dp)
        cout << x << " ";
    cout << "\n";

    // Find index of max length
    int maxLen = *max_element(dp.begin(), dp.end());
    int idx = max_element(dp.begin(), dp.end()) - dp.begin();

    // Reconstruct
    vector<int> lis;
    while (idx != -1)
    {
        lis.push_back(nums[idx]);
        idx = parent[idx];
    }
    reverse(lis.begin(), lis.end());

    return {maxLen, lis};
}

int main()
{
    // Part 1
    cout << "=== Part 1: 0/1 Knapsack ===\n";
    vector<int> weights = {1, 3, 4, 5};
    vector<int> values = {1, 4, 5, 7};
    int W = 7;
    cout << "Max value = " << knapsack(weights, values, W) << "\n\n";

    // Part 2
    cout << "=== Part 2: LCS ===\n";
    string s1 = "ABCBDAB", s2 = "BDCAB";
    auto [len, lcs] = LCS(s1, s2);
    cout << "\ns1=\"" << s1 << "\" s2=\"" << s2 << "\"\n";
    cout << "LCS length = " << len << "\n";
    cout << "LCS string = \"" << lcs << "\"\n\n";

    // Part 3
    cout << "=== Part 3: LIS ===\n";
    vector<int> nums = {10, 9, 2, 5, 3, 7, 101, 18};
    auto [lisLen, lisSeq] = LIS(nums);
    cout << "Array: 10 9 2 5 3 7 101 18\n";
    cout << "LIS length = " << lisLen << "\n";
    cout << "LIS        = ";
    for (int x : lisSeq)
        cout << x << " ";
    cout << "\n";

    return 0;
}