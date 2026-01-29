// Staircase (1) : You have N stairs in front of you.
// At every step, you can either climb up by 1, 2 or 3 stairs.
// How many ways are there to climb to the top?

#include <iostream>
#include <vector>
using namespace std;

long long solve(int i, int N, vector<long long> &dp)
{
    if (i == N)
        return 1; // reached top
    if (i > N)
        return 0; // crossed top
    if (dp[i] != -1)
        return dp[i];

    dp[i] = solve(i + 1, N, dp) + solve(i + 2, N, dp) + solve(i + 3, N, dp);

    return dp[i];
}

int main()
{
    int N;
    cin >> N;

    vector<long long> dp(N + 1, -1);

    cout << solve(0, N, dp);

    return 0;
}