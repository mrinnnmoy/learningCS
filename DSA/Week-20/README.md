# List of things learned.

## 1. Introduction to Dynamic Programming

**Dynamic Programming (DP)** is an algorithmic technique for solving complex problems by breaking them down into simpler overlapping subproblems and storing the results to avoid redundant computation.

The term was coined by **Richard Bellman** in the 1950s. The word "programming" here refers to mathematical planning, not writing code.

### The Core Idea

```
"Those who cannot remember the past are condemned to repeat it."
                                          — George Santayana

In DP terms:
"Those who cannot remember computed subproblems are condemned
 to recompute them."
```

### Simple Analogy

Think of climbing stairs where you can take 1 or 2 steps at a time.
To find ways to reach step 5, you need ways to reach step 4 and step 3.

Instead of recalculating those every time, you **store** them.

```
ways(5) = ways(4) + ways(3)
ways(4) = ways(3) + ways(2)
ways(3) = ways(2) + ways(1)
ways(2) = ways(1) + ways(0) = 1 + 1 = 2
ways(1) = 1
ways(0) = 1

Build up:
ways(0)=1, ways(1)=1, ways(2)=2, ways(3)=3, ways(4)=5, ways(5)=8
```

---

## 2. When to Use Dynamic Programming

A problem is suitable for DP if it has **both** of the following properties:

### 2.1 Overlapping Subproblems

The same subproblems are solved multiple times during recursion.

```
Fibonacci without DP — fib(5):

                    fib(5)
                  /        \
              fib(4)        fib(3)
             /      \      /     \
         fib(3)  fib(2) fib(2) fib(1)
         /    \
      fib(2) fib(1)

fib(3) computed TWICE
fib(2) computed THREE times  ← overlapping subproblems!
```

### 2.2 Optimal Substructure

The optimal solution to the problem contains optimal solutions to subproblems.

```
Shortest path from A to C passing through B:
  shortest(A→C) = shortest(A→B) + shortest(B→C)

If shortest(A→B) is not optimal, then shortest(A→C) won't be either.
→ Optimal substructure holds.
```

### How to Identify a DP Problem

Ask these questions:

1. Does the problem ask for a **count**, **maximum**, **minimum**, or **true/false**?
2. Can the problem be broken into **smaller versions of itself**?
3. Are there **repeated subproblems** in the recursion tree?
4. Does the problem involve **choices** at each step?

If yes to most → **think DP**.

---

## 3. DP vs Recursion vs Greedy

| Aspect      | Recursion           | Greedy           | Dynamic Programming  |
| ----------- | ------------------- | ---------------- | -------------------- |
| Subproblems | Recomputes          | Ignores past     | Stores results       |
| Choices     | Explores all        | Makes one best   | Explores all, stores |
| Correctness | Always (if correct) | Not always       | Always (if correct)  |
| Time        | Exponential often   | O(n log n) often | Polynomial often     |
| Space       | O(depth)            | O(1) often       | O(states)            |

---

## 4. Two Approaches to DP

### 4.1 Top-Down (Memoization)

Start from the original problem, recurse down, and **cache** results as you go.

```
Direction: Big problem → smaller subproblems → base case
Style     : Recursive + cache (usually a map or array)
```

```cpp
// Fibonacci — Top Down
#include <vector>
using namespace std;

int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];    // Return cached result

    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}

int fibonacci(int n) {
    vector<int> memo(n+1, -1);
    return fib(n, memo);
}
```

**Pros:** Only computes subproblems that are actually needed

**Cons:** Recursive call stack overhead; stack overflow for large n

---

### 4.2 Bottom-Up (Tabulation)

Start from the base cases and build up to the answer iteratively.

```
Direction: Base case → build up → original problem
Style     : Iterative + table (usually an array)
```

```cpp
// Fibonacci — Bottom Up
int fibonacci(int n) {
    if (n <= 1) return n;
    vector<int> dp(n+1);
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}
```

**Pros:** No recursion overhead; no stack overflow risk

**Cons:** May compute unnecessary subproblems

---

### 4.3 Space Optimization

Many DP problems only need the **previous 1 or 2 values**, not the full table.

```cpp
// Fibonacci — Space Optimized O(1) space
int fibonacci(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

---

### Comparison

|                       | Top-Down                | Bottom-Up              |
| --------------------- | ----------------------- | ---------------------- |
| Implementation        | Recursive               | Iterative              |
| Subproblems computed  | Only needed ones        | All (in order)         |
| Space                 | O(n) + stack            | O(n)                   |
| Cache                 | `memo` array/map        | `dp` table             |
| Easier to think about | Yes (natural recursion) | Needs ordering insight |

---

## 5. DP on 1D Arrays

### 5.1 Fibonacci Numbers

The classic DP introduction.

```
F(0) = 0
F(1) = 1
F(n) = F(n-1) + F(n-2)

Without DP: O(2^n)
With DP:    O(n)  time, O(1) space
```

---

### 5.2 Climbing Stairs

**Problem:** You can climb 1 or 2 stairs at a time. How many distinct ways to reach the nth stair?

```
n=1: {1}                         → 1 way
n=2: {1,1}, {2}                  → 2 ways
n=3: {1,1,1}, {1,2}, {2,1}       → 3 ways
n=4: {1,1,1,1},{1,1,2},{1,2,1},
     {2,1,1},{2,2}               → 5 ways

Pattern: ways(n) = ways(n-1) + ways(n-2)  → Same as Fibonacci!
```

```cpp
int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

**Time Complexity:** O(n)

**Space Complexity:** O(1)

---

### 5.3 House Robber

**Problem:** Given an array of house values, rob maximum money without robbing two adjacent houses.

```
Houses: [2, 7, 9, 3, 1]

At each house, choose: rob it (skip previous) OR skip it (keep previous best)

dp[i] = max(dp[i-1], dp[i-2] + houses[i])

dp[0] = 2
dp[1] = max(2, 7) = 7
dp[2] = max(7, 2+9) = 11
dp[3] = max(11, 7+3) = 11
dp[4] = max(11, 11+1) = 12

Answer: 12  (rob houses 0,2,4 → 2+9+1=12)
```

```cpp
int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];

    int prev2 = nums[0];
    int prev1 = max(nums[0], nums[1]);

    for (int i = 2; i < n; i++) {
        int curr = max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

**Time Complexity:** O(n)

**Space Complexity:** O(1)

---

### 5.4 Maximum Subarray (Kadane's Algorithm)

**Problem:** Find the contiguous subarray with the largest sum.

```
Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]

dp[i] = max(nums[i], dp[i-1] + nums[i])
      = either start fresh at i, or extend previous subarray

dp: [-2, 1, -2, 4, 3, 5, 6, 1, 5]

Max = 6  (subarray [4,-1,2,1])
```

```cpp
int maxSubArray(vector<int>& nums) {
    int maxSum  = nums[0];
    int currSum = nums[0];

    for (int i = 1; i < nums.size(); i++) {
        currSum = max(nums[i], currSum + nums[i]);
        maxSum  = max(maxSum, currSum);
    }
    return maxSum;
}
```

**Time Complexity:** O(n)

**Space Complexity:** O(1)

---

### 5.5 Coin Change (Minimum Coins)

**Problem:** Given coin denominations and target amount, find minimum coins needed.

```
Coins: [1, 5, 6, 9]   Amount: 11

dp[i] = min coins to make amount i
dp[0] = 0  (0 coins to make amount 0)
dp[i] = INF initially (not reachable)

For each amount i from 1 to 11:
  For each coin c:
    if i >= c: dp[i] = min(dp[i], dp[i-c] + 1)

dp[1]  = dp[0]  + 1 = 1  (use coin 1)
dp[5]  = dp[0]  + 1 = 1  (use coin 5)
dp[6]  = dp[0]  + 1 = 1  (use coin 6)
dp[9]  = dp[0]  + 1 = 1  (use coin 9)
dp[10] = dp[4]  + 1 or dp[9]+1 or dp[1]+1 = 2 (use 9+1)
dp[11] = dp[5]  + 1 = 2  (use 5+6)

Answer: 2
```

```cpp
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i && dp[i - coin] != INT_MAX)
                dp[i] = min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}
```

**Time Complexity:** O(amount × coins)

**Space Complexity:** O(amount)

---

### 5.6 Longest Increasing Subsequence (LIS)

**Problem:** Find the length of the longest strictly increasing subsequence.

```
Array: [10, 9, 2, 5, 3, 7, 101, 18]

dp[i] = length of LIS ending at index i

dp[0] = 1  (just 10)
dp[1] = 1  (just 9)
dp[2] = 1  (just 2)
dp[3] = 2  (2,5)
dp[4] = 2  (2,3)
dp[5] = 3  (2,3,7) or (2,5,7)
dp[6] = 4  (2,3,7,101)
dp[7] = 4  (2,3,7,18)

Answer: 4
```

```cpp
int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);   // Each element is LIS of length 1

    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])
                dp[i] = max(dp[i], dp[j] + 1);

    return *max_element(dp.begin(), dp.end());
}
```

**Time Complexity:** O(n²)

**Space Complexity:** O(n)

---

## 6. DP on 2D Arrays / Grids

### 6.1 Unique Paths

**Problem:** Count unique paths from top-left to bottom-right of an m×n grid (only right or down moves).

```
3×3 grid:
dp[i][j] = unique paths to reach cell (i,j)
         = dp[i-1][j] + dp[i][j-1]  (from above + from left)

dp:
1  1  1
1  2  3
1  3  6

Answer: 6 unique paths
```

```cpp
int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));

    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];

    return dp[m-1][n-1];
}
```

**Time Complexity:** O(m×n)

**Space Complexity:** O(m×n) → can be reduced to O(n)

---

### 6.2 Minimum Path Sum

**Problem:** Find the path from top-left to bottom-right with minimum sum (only right or down).

```
Grid:
1  3  1
1  5  1
4  2  1

dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]

dp:
1  4  5
2  7  6
6  8  7

Answer: 7  (path: 1→3→1→1→1)
```

```cpp
int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n));
    dp[0][0] = grid[0][0];

    for (int j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
    for (int i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];

    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j];

    return dp[m-1][n-1];
}
```

**Time Complexity:** O(m×n)

**Space Complexity:** O(m×n)

---

## 7. DP on Strings

### 7.1 Longest Common Subsequence (LCS)

**Problem:** Find the length of the longest subsequence common to both strings. A subsequence doesn't need to be contiguous.

```
s1 = "ABCBDAB"
s2 = "BDCAB"

dp[i][j] = LCS of s1[0..i-1] and s2[0..j-1]

If s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
Else:                   dp[i][j] = max(dp[i-1][j], dp[i][j-1])

     ""  B  D  C  A  B
""    0  0  0  0  0  0
A     0  0  0  0  1  1
B     0  1  1  1  1  2
C     0  1  1  2  2  2
B     0  1  1  2  2  3
D     0  1  2  2  2  3
A     0  1  2  2  3  3
B     0  1  2  2  3  4

LCS length = 4  ("BCAB" or "BDAB")
```

```cpp
int LCS(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}
```

**Time Complexity:** O(m×n)

**Space Complexity:** O(m×n)

---

### 7.2 Longest Common Substring

**Problem:** Find the longest **contiguous** substring common to both strings.

```
s1 = "abcde"
s2 = "abfce"

dp[i][j] = length of common substring ending at s1[i-1] and s2[j-1]

If s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
Else:                   dp[i][j] = 0  ← reset (must be contiguous)

     ""  a  b  f  c  e
""    0  0  0  0  0  0
a     0  1  0  0  0  0
b     0  0  2  0  0  0
c     0  0  0  0  1  0
d     0  0  0  0  0  0
e     0  0  0  0  0  1

Max value = 2  ("ab")
```

```cpp
int longestCommonSubstring(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    int maxLen = 0;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
                maxLen   = max(maxLen, dp[i][j]);
            } else {
                dp[i][j] = 0;   // Reset — must be contiguous
            }
        }
    }
    return maxLen;
}
```

---

### 7.3 Edit Distance (Levenshtein Distance)

**Problem:** Minimum number of operations (insert, delete, replace) to convert string s1 to s2.

```
s1 = "horse"
s2 = "ros"

dp[i][j] = edit distance between s1[0..i-1] and s2[0..j-1]

If chars match:  dp[i][j] = dp[i-1][j-1]
If not:          dp[i][j] = 1 + min(
                               dp[i-1][j],    // delete from s1
                               dp[i][j-1],    // insert into s1
                               dp[i-1][j-1]   // replace
                             )

     ""  r  o  s
""    0  1  2  3
h     1  1  2  3
o     2  2  1  2
r     3  2  2  2
s     4  3  3  2
e     5  4  4  3

Answer: 3
```

```cpp
int editDistance(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1));

    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1])
                dp[i][j] = dp[i-1][j-1];
            else
                dp[i][j] = 1 + min({dp[i-1][j],
                                    dp[i][j-1],
                                    dp[i-1][j-1]});
        }
    }
    return dp[m][n];
}
```

**Time Complexity:** O(m×n)

**Space Complexity:** O(m×n)

---

### 7.4 Palindrome Partitioning (Min Cuts)

**Problem:** Find minimum number of cuts to partition a string so every part is a palindrome.

```
s = "aab"

Partitions:
  "a|a|b" → 2 cuts    (all palindromes)
  "aa|b"  → 1 cut     (aa is palindrome, b is palindrome)

Answer: 1
```

```cpp
bool isPalin(string& s, int l, int r) {
    while (l < r) if (s[l++] != s[r--]) return false;
    return true;
}

int minCut(string s) {
    int n = s.size();
    vector<int> dp(n);   // dp[i] = min cuts for s[0..i]

    for (int i = 0; i < n; i++) {
        if (isPalin(s, 0, i)) { dp[i] = 0; continue; }
        dp[i] = i;   // Worst case: cut before every character
        for (int j = 1; j <= i; j++)
            if (isPalin(s, j, i))
                dp[i] = min(dp[i], dp[j-1] + 1);
    }
    return dp[n-1];
}
```

---

## 8. Knapsack Problems

The Knapsack family is one of the most important DP problem families.

### 8.1 0/1 Knapsack

**Problem:** Given items with weights and values, and a knapsack of capacity W, maximize total value. Each item can be taken **at most once**.

```
Items:    weight=[1,3,4,5]  value=[1,4,5,7]
Capacity: W = 7

dp[i][w] = max value using first i items with capacity w

If weight[i-1] > w: dp[i][w] = dp[i-1][w]  (can't take item)
Else: dp[i][w] = max(dp[i-1][w],              (skip item)
                     dp[i-1][w-weight[i-1]] + value[i-1])  (take item)

      0  1  2  3  4  5  6  7
  []  0  0  0  0  0  0  0  0
w=1   0  1  1  1  1  1  1  1
w=3   0  1  1  4  5  5  5  5
w=4   0  1  1  4  5  6  6  9
w=5   0  1  1  4  5  7  8  9

Answer: 9
```

```cpp
int knapsack01(vector<int>& weights, vector<int>& values,
               int W) {
    int n = weights.size();
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            // Don't take item i
            dp[i][w] = dp[i-1][w];

            // Take item i (if it fits)
            if (weights[i-1] <= w)
                dp[i][w] = max(dp[i][w],
                               dp[i-1][w - weights[i-1]] + values[i-1]);
        }
    }
    return dp[n][W];
}
```

**Time Complexity:** O(n×W)

**Space Complexity:** O(n×W) → can be reduced to O(W)

---

### 8.2 Unbounded Knapsack

**Problem:** Same as 0/1 Knapsack but each item can be taken **unlimited times**.

```
The key change: use dp[i][w] instead of dp[i-1][w] when taking an item
→ allows reusing the same item
```

```cpp
int unboundedKnapsack(vector<int>& weights, vector<int>& values,
                      int W) {
    int n = weights.size();
    vector<int> dp(W+1, 0);

    for (int w = 1; w <= W; w++)
        for (int i = 0; i < n; i++)
            if (weights[i] <= w)
                dp[w] = max(dp[w], dp[w - weights[i]] + values[i]);

    return dp[W];
}
```

---

### 8.3 Subset Sum

**Problem:** Given a set of integers and target S, can any subset sum to S?

```
Array: [3, 34, 4, 12, 5, 2]   Target: 9

dp[i][s] = can we achieve sum s using first i elements?

Answer: true  (4 + 5 = 9)
```

```cpp
bool subsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    vector<vector<bool>> dp(n+1, vector<bool>(target+1, false));

    // Empty subset sums to 0
    for (int i = 0; i <= n; i++) dp[i][0] = true;

    for (int i = 1; i <= n; i++) {
        for (int s = 0; s <= target; s++) {
            dp[i][s] = dp[i-1][s];   // Don't take nums[i-1]
            if (nums[i-1] <= s)
                dp[i][s] = dp[i][s] || dp[i-1][s - nums[i-1]];
        }
    }
    return dp[n][target];
}
```

---

### 8.4 Partition Equal Subset Sum

**Problem:** Can the array be partitioned into two subsets with equal sum?

```
Array: [1, 5, 11, 5]
Total = 22, target = 11

Find subset summing to 11:
  {1, 5, 5} = 11 ✓  and  {11} = 11 ✓

Answer: true
```

```cpp
bool canPartition(vector<int>& nums) {
    int total = 0;
    for (int n : nums) total += n;

    if (total % 2 != 0) return false;   // Odd total can't split equally
    int target = total / 2;

    return subsetSum(nums, target);   // Reuse subset sum
}
```

---

## 9. DP on Intervals

### 9.1 Matrix Chain Multiplication

**Problem:** Given dimensions of a chain of matrices, find the minimum number of scalar multiplications needed.

```
Matrices: A(10×30), B(30×5), C(5×60)

Option 1: (AB)C → 10×30×5 + 10×5×60 = 1500 + 3000 = 4500
Option 2: A(BC) → 30×5×60 + 10×30×60 = 9000 + 18000 = 27000

Answer: 4500

dp[i][j] = min cost to multiply matrices i through j
dp[i][j] = min over all k of: dp[i][k] + dp[k+1][j] + dims[i-1]*dims[k]*dims[j]
```

```cpp
int matrixChain(vector<int>& dims) {
    int n = dims.size() - 1;   // Number of matrices
    vector<vector<int>> dp(n+1, vector<int>(n+1, 0));

    // l = chain length
    for (int l = 2; l <= n; l++) {
        for (int i = 1; i <= n - l + 1; i++) {
            int j = i + l - 1;
            dp[i][j] = INT_MAX;

            for (int k = i; k < j; k++) {
                int cost = dp[i][k] + dp[k+1][j]
                         + dims[i-1] * dims[k] * dims[j];
                dp[i][j] = min(dp[i][j], cost);
            }
        }
    }
    return dp[1][n];
}
```

**Time Complexity:** O(n³)

**Space Complexity:** O(n²)

---

### 9.2 Burst Balloons

**Problem:** Given balloons with values, burst all balloons to maximize coins. Bursting balloon i earns `nums[i-1] × nums[i] × nums[i+1]`.

```
nums = [3, 1, 5, 8]

dp[i][j] = max coins from bursting all balloons between i and j
           (treating i and j as boundaries, not burst themselves)

Key insight: Think of which balloon is burst LAST in range [i,j]
dp[i][j] = max over k of: nums[i]*nums[k]*nums[j] + dp[i][k] + dp[k][j]
```

```cpp
int maxCoins(vector<int>& nums) {
    int n = nums.size();
    // Add boundary balloons with value 1
    nums.insert(nums.begin(), 1);
    nums.push_back(1);

    vector<vector<int>> dp(n+2, vector<int>(n+2, 0));

    for (int len = 1; len <= n; len++) {
        for (int l = 1; l <= n - len + 1; l++) {
            int r = l + len - 1;
            for (int k = l; k <= r; k++) {
                dp[l][r] = max(dp[l][r],
                    dp[l][k-1] + nums[l-1]*nums[k]*nums[r+1] + dp[k+1][r]);
            }
        }
    }
    return dp[1][n];
}
```

---

## 10. DP Patterns. (Quick Reference)

Understanding patterns helps you recognize DP problems quickly:

| Pattern      | Example Problems                         | State Definition                          |
| ------------ | ---------------------------------------- | ----------------------------------------- |
| Linear DP    | Fibonacci, Climbing Stairs, House Robber | dp[i] = answer for first i elements       |
| Kadane's     | Max Subarray, Max Product                | dp[i] = best ending at i                  |
| LCS/LIS      | Common Subsequence, Edit Distance        | dp[i][j] = answer for prefixes i,j        |
| Knapsack     | 0/1 Knapsack, Subset Sum                 | dp[i][w] = answer using i items, weight w |
| Grid DP      | Unique Paths, Min Path Sum               | dp[i][j] = answer at cell (i,j)           |
| Interval DP  | Matrix Chain, Burst Balloons             | dp[i][j] = answer for range [i,j]         |
| Partition DP | Palindrome Cut, Word Break               | dp[i] = answer for s[0..i]                |

---

## 11. Common DP Mistakes & Tips

### Mistakes to Avoid

- **Wrong base case** : Always initialize carefully. Off-by-one errors in base cases are the #1 DP bug
- **Wrong transition** : Draw the recurrence relation explicitly before coding
- **Integer overflow** : Use `long long` when values can be large; check before adding
- **Forgetting to initialize to INF/0** : Uninitialized dp values cause wrong answers silently
- **Confusing subsequence vs substring** : Subsequence doesn't reset on mismatch; substring does

### Tips for Solving DP Problems

```
Step 1: Identify if DP applies
        → Overlapping subproblems? Optimal substructure?

Step 2: Define the state
        → What does dp[i] or dp[i][j] represent?

Step 3: Write the recurrence relation
        → How does dp[i] relate to smaller subproblems?

Step 4: Identify base cases
        → What are the smallest valid inputs?

Step 5: Decide direction
        → Top-down (memo) or Bottom-up (tabulation)?

Step 6: Check for space optimization
        → Do you need the full table or just previous rows/cols?
```

---

## 12. Time & Space Complexity Summary

| Problem         | Time        | Space     | Optimized Space |
| --------------- | ----------- | --------- | --------------- |
| Fibonacci       | O(n)        | O(n)      | O(1)            |
| Climbing Stairs | O(n)        | O(n)      | O(1)            |
| House Robber    | O(n)        | O(n)      | O(1)            |
| Max Subarray    | O(n)        | O(1)      | O(1)            |
| Coin Change     | O(n×amount) | O(amount) | —               |
| LIS             | O(n²)       | O(n)      | —               |
| Unique Paths    | O(m×n)      | O(m×n)    | O(n)            |
| Min Path Sum    | O(m×n)      | O(m×n)    | O(n)            |
| LCS             | O(m×n)      | O(m×n)    | O(n)            |
| Edit Distance   | O(m×n)      | O(m×n)    | O(n)            |
| 0/1 Knapsack    | O(n×W)      | O(n×W)    | O(W)            |
| Subset Sum      | O(n×S)      | O(n×S)    | O(S)            |
| Matrix Chain    | O(n³)       | O(n²)     | —               |

---

## Assignments

1. **Classic 1D DP Problems.**

   **Task:** Solve all four problems using **bottom-up DP** with a clear `dp` array. Print the `dp` array after building it to show the thought process.

   **Part 1 — Climbing Stairs:**
   Find distinct ways to reach nth stair (1 or 2 steps at a time). Test: n = 5, n = 10.

   **Part 2 — House Robber:**
   Find max money without robbing adjacent houses.
   Test: `[2,7,9,3,1]` → 12, `[2,1,1,2]` → 4.

   **Part 3 — Coin Change:**
   Find minimum coins to make the amount.
   Test: coins=`[1,5,6,9]`, amount=11 → 2. coins=`[2]`, amount=3 → -1.

   **Part 4 — Maximum Subarray:**
   Find the maximum sum contiguous subarray.
   Test: `[-2,1,-3,4,-1,2,1,-5,4]` → 6.

   [Solution](./Assignment/code1.cpp)

2. **0/1 Knapsack + LCS + LIS.**

   **Task:** Solve all three classic DP problems. For each, print the full DP table to trace the solution.

   **Part 1 — 0/1 Knapsack:**
   Given weights and values, find maximum value within capacity.
   Test: weights=`[1,3,4,5]`, values=`[1,4,5,7]`, W=7 → 9.

   **Part 2 — Longest Common Subsequence:**
   Find the LCS length and also print the actual LCS string.
   Test: s1="ABCBDAB", s2="BDCAB" → length=4, LCS="BCAB".

   **Part 3 — Longest Increasing Subsequence:**
   Find the LIS length and print the actual subsequence.
   Test: `[10,9,2,5,3,7,101,18]` → length=4, LIS=`[2,3,7,101]`.

   [Solution](./Assignment/code2.cpp)

3. **Edit Distance + Minimum Path Sum + Partition Problems.**

   **Task:** Solve all three parts:

   **Part 1 — Edit Distance:**
   Find minimum operations (insert, delete, replace) to convert s1 to s2.
   Print the full DP table and trace back the operations performed.
   Test: s1="horse", s2="ros" → 3 ops.
   Test: s1="intention", s2="execution" → 5 ops.

   **Part 2 — Minimum Path Sum in Grid:**
   Find minimum cost path from top-left to bottom-right.
   Print the dp grid and trace the actual path taken.
   Test:

   ```
   Grid:
   1  3  1
   1  5  1
   4  2  1
   Answer: 7  (path: 1→3→1→1→1)
   ```

   **Part 3 — Partition Equal Subset Sum:**
   Determine if array can be split into two subsets with equal sum. Print the dp table.
   Test: `[1,5,11,5]` → true. `[1,2,3,5]` → false.

   [Solution](./Assignment/code3.cpp)
