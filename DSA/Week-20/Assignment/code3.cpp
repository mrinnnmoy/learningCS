#include <iostream>
#include <vector>
#include <string>
#include <numeric>
using namespace std;

// ── Part 1: Edit Distance ─────────────────────
int editDistance(string &s1, string &s2)
{
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));

    for (int i = 0; i <= m; i++)
        dp[i][0] = i;
    for (int j = 0; j <= n; j++)
        dp[0][j] = j;

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
        {
            if (s1[i - 1] == s2[j - 1])
                dp[i][j] = dp[i - 1][j - 1];
            else
                dp[i][j] = 1 + min({dp[i - 1][j],
                                    dp[i][j - 1],
                                    dp[i - 1][j - 1]});
        }

    // Print DP table
    cout << "Edit Distance DP (\""
         << s1 << "\" → \"" << s2 << "\"):\n";
    cout << "    \"\" ";
    for (char c : s2)
        cout << " " << c << " ";
    cout << "\n\"\" ";
    for (int j = 0; j <= n; j++)
        cout << dp[0][j] << "  ";
    cout << "\n";
    for (int i = 1; i <= m; i++)
    {
        cout << s1[i - 1] << "  ";
        for (int j = 0; j <= n; j++)
            cout << dp[i][j] << "  ";
        cout << "\n";
    }

    // Traceback operations
    cout << "Operations: ";
    int i = m, j = n;
    vector<string> ops;
    while (i > 0 || j > 0)
    {
        if (i > 0 && j > 0 && s1[i - 1] == s2[j - 1])
        {
            i--;
            j--;
        }
        else if (j > 0 && (i == 0 || dp[i][j - 1] <= dp[i - 1][j] && dp[i][j - 1] <= dp[i - 1][j - 1]))
        {
            ops.push_back("Insert '" + string(1, s2[j - 1]) + "'");
            j--;
        }
        else if (i > 0 && (j == 0 || dp[i - 1][j] <= dp[i][j - 1] && dp[i - 1][j] <= dp[i - 1][j - 1]))
        {
            ops.push_back("Delete '" + string(1, s1[i - 1]) + "'");
            i--;
        }
        else
        {
            ops.push_back("Replace '" + string(1, s1[i - 1]) + "'→'" + string(1, s2[j - 1]) + "'");
            i--;
            j--;
        }
    }
    for (auto it = ops.rbegin(); it != ops.rend(); it++)
        cout << *it << " | ";
    cout << "\nMin operations = " << dp[m][n] << "\n\n";

    return dp[m][n];
}

// ── Part 2: Min Path Sum ──────────────────────
int minPathSum(vector<vector<int>> &grid)
{
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n));
    dp[0][0] = grid[0][0];

    for (int j = 1; j < n; j++)
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    for (int i = 1; i < m; i++)
        dp[i][0] = dp[i - 1][0] + grid[i][0];

    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];

    // Print dp grid
    cout << "Min Path Sum DP grid:\n";
    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < n; j++)
            cout << dp[i][j] << "  ";
        cout << "\n";
    }

    // Trace path
    cout << "Path: ";
    vector<pair<int, int>> path;
    int i = m - 1, j = n - 1;
    path.push_back({i, j});
    while (i > 0 || j > 0)
    {
        if (i == 0)
            j--;
        else if (j == 0)
            i--;
        else if (dp[i - 1][j] < dp[i][j - 1])
            i--;
        else
            j--;
        path.push_back({i, j});
    }
    reverse(path.begin(), path.end());
    for (auto &[r, c] : path)
        cout << grid[r][c] << " ";
    cout << "\nMin sum = " << dp[m - 1][n - 1] << "\n\n";

    return dp[m - 1][n - 1];
}

// ── Part 3: Partition Equal Subset Sum ────────
bool canPartition(vector<int> &nums)
{
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2 != 0)
        return false;
    int target = total / 2;
    int n = nums.size();

    vector<vector<bool>> dp(n + 1, vector<bool>(target + 1, false));
    for (int i = 0; i <= n; i++)
        dp[i][0] = true;

    for (int i = 1; i <= n; i++)
        for (int s = 1; s <= target; s++)
        {
            dp[i][s] = dp[i - 1][s];
            if (nums[i - 1] <= s)
                dp[i][s] = dp[i][s] || dp[i - 1][s - nums[i - 1]];
        }

    // Print dp table
    cout << "Partition DP (target=" << target << "):\n";
    cout << "    ";
    for (int s = 0; s <= target; s++)
        cout << s << " ";
    cout << "\n";
    for (int i = 0; i <= n; i++)
    {
        if (i == 0)
            cout << "[] ";
        else
            cout << nums[i - 1] << "  ";
        for (int s = 0; s <= target; s++)
            cout << dp[i][s] << " ";
        cout << "\n";
    }
    return dp[n][target];
}

int main()
{
    // Part 1
    cout << "=== Part 1: Edit Distance ===\n";
    string s1a = "horse", s2a = "ros";
    string s1b = "intention", s2b = "execution";
    editDistance(s1a, s2a);
    editDistance(s1b, s2b);

    // Part 2
    cout << "=== Part 2: Minimum Path Sum ===\n";
    vector<vector<int>> grid = {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}};
    cout << "Grid:\n";
    for (auto &row : grid)
    {
        for (int v : row)
            cout << v << "  ";
        cout << "\n";
    }
    cout << "\n";
    minPathSum(grid);

    // Part 3
    cout << "=== Part 3: Partition Equal Subset Sum ===\n";
    vector<int> a1 = {1, 5, 11, 5};
    vector<int> a2 = {1, 2, 3, 5};

    cout << "[1,5,11,5]:\n";
    cout << "Can partition: "
         << (canPartition(a1) ? "true" : "false") << "\n\n";

    cout << "[1,2,3,5]:\n";
    cout << "Can partition: "
         << (canPartition(a2) ? "true" : "false") << "\n";

    return 0;
}