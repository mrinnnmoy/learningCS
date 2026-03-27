#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// ── Part 1: Merge Intervals ───────────────────
void mergeIntervals(vector<pair<int, int>> intervals)
{
    sort(intervals.begin(), intervals.end());

    cout << "Merge Intervals:\n";
    cout << "----------------------------------------------\n";
    cout << "Input  : ";
    for (auto &p : intervals)
        cout << "[" << p.first << "," << p.second << "] ";
    cout << "\n";

    vector<pair<int, int>> merged;
    merged.push_back(intervals[0]);

    for (int i = 1; i < intervals.size(); i++)
    {
        if (intervals[i].first <= merged.back().second)
        {
            cout << "[" << intervals[i].first << ","
                 << intervals[i].second << "] overlaps with ["
                 << merged.back().first << ","
                 << merged.back().second << "] → merging\n";
            merged.back().second = max(merged.back().second,
                                       intervals[i].second);
        }
        else
        {
            cout << "[" << intervals[i].first << ","
                 << intervals[i].second << "] no overlap → add new\n";
            merged.push_back(intervals[i]);
        }
    }

    cout << "Output : ";
    for (auto &p : merged)
        cout << "[" << p.first << "," << p.second << "] ";
    cout << "\n";
}

// ── Part 2: Minimum Platforms ─────────────────
void minPlatforms(vector<int> arr, vector<int> dep)
{
    sort(arr.begin(), arr.end());
    sort(dep.begin(), dep.end());

    cout << "\nMinimum Platforms:\n";
    cout << "----------------------------------------------\n";

    int platforms = 1, maxPlatforms = 1;
    int i = 1, j = 0;

    cout << "Train arrives at " << arr[0]
         << " → platforms needed: 1\n";

    while (i < arr.size() && j < dep.size())
    {
        if (arr[i] <= dep[j])
        {
            platforms++;
            cout << "Train arrives  at " << arr[i]
                 << " → platforms=" << platforms << "\n";
            i++;
        }
        else
        {
            platforms--;
            cout << "Train departs  at " << dep[j]
                 << " → platforms=" << platforms << "\n";
            j++;
        }
        maxPlatforms = max(maxPlatforms, platforms);
    }
    cout << "Minimum platforms needed: " << maxPlatforms << "\n";
}

// ── Part 3: Jump Game II ──────────────────────
void jumpGameII(vector<int> &nums)
{
    cout << "\nJump Game II:\n";
    cout << "----------------------------------------------\n";
    cout << "Array : ";
    for (int x : nums)
        cout << x << " ";
    cout << "\n\n";

    int jumps = 0, currentEnd = 0, farthest = 0;
    int n = nums.size();

    for (int i = 0; i < n - 1; i++)
    {
        farthest = max(farthest, i + nums[i]);

        if (i == currentEnd)
        {
            jumps++;
            cout << "Jump " << jumps
                 << " → from index " << currentEnd
                 << " reach as far as index " << farthest << "\n";
            currentEnd = farthest;
            if (currentEnd >= n - 1)
                break;
        }
    }
    cout << "\nMinimum jumps to reach end: " << jumps << "\n";
}

int main()
{
    // Part 1
    vector<pair<int, int>> intervals = {
        {1, 3}, {2, 6}, {8, 10}, {9, 11}, {15, 18}, {16, 20}};
    mergeIntervals(intervals);

    // Part 2
    vector<int> arr = {900, 940, 950, 1100, 1500, 1800};
    vector<int> dep = {910, 1200, 1120, 1130, 1900, 2000};
    minPlatforms(arr, dep);

    // Part 3
    vector<int> nums = {2, 3, 1, 1, 4, 2, 1, 3, 1};
    jumpGameII(nums);

    return 0;
}