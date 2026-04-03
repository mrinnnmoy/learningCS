#include <iostream>
#include <queue>
#include <vector>
#include <tuple>
using namespace std;

// ── Part 1: Running Median ────────────────────
class MedianFinder
{
private:
    priority_queue<int> maxH;                            // left half
    priority_queue<int, vector<int>, greater<int>> minH; // right half

public:
    void addNum(int num)
    {
        // Push to max heap
        maxH.push(num);

        // Ensure max of left <= min of right
        if (!minH.empty() && maxH.top() > minH.top())
        {
            minH.push(maxH.top());
            maxH.pop();
        }

        // Balance sizes
        if (maxH.size() > minH.size() + 1)
        {
            minH.push(maxH.top());
            maxH.pop();
        }
        else if (minH.size() > maxH.size())
        {
            maxH.push(minH.top());
            minH.pop();
        }
    }

    double getMedian()
    {
        if (maxH.size() == minH.size())
            return (maxH.top() + minH.top()) / 2.0;
        return maxH.top();
    }
};

// ── Part 2: Merge K Sorted Arrays ────────────
vector<int> mergeKSorted(vector<vector<int>> &arrays)
{
    // {value, array_index, element_index}
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> minHeap;

    // Push first element of each array
    for (int i = 0; i < (int)arrays.size(); i++)
        if (!arrays[i].empty())
            minHeap.push({arrays[i][0], i, 0});

    vector<int> result;

    cout << "Merge steps:\n";
    while (!minHeap.empty())
    {
        auto [val, arrIdx, elemIdx] = minHeap.top();
        minHeap.pop();

        result.push_back(val);
        cout << "  Extracted " << val
             << " from array[" << arrIdx << "]\n";

        if (elemIdx + 1 < (int)arrays[arrIdx].size())
            minHeap.push({arrays[arrIdx][elemIdx + 1],
                          arrIdx,
                          elemIdx + 1});
    }
    return result;
}

int main()
{
    // ── Part 1 ───────────────────────────────
    cout << "=== Part 1: Running Median ===\n";
    cout << "-------------------------------\n";
    MedianFinder mf;
    vector<int> stream = {5, 15, 1, 3, 2, 8, 7, 9, 10, 6, 11, 4};

    for (int num : stream)
    {
        mf.addNum(num);
        double med = mf.getMedian();
        cout << "Added " << num
             << " → median = " << med << "\n";
    }

    // ── Part 2 ───────────────────────────────
    cout << "\n=== Part 2: Merge K Sorted Arrays ===\n";
    cout << "--------------------------------------\n";
    vector<vector<int>> arrays = {
        {1, 4, 7, 10},
        {2, 5, 8, 11},
        {3, 6, 9, 12}};

    vector<int> merged = mergeKSorted(arrays);
    cout << "\nMerged result: ";
    for (int x : merged)
        cout << x << " ";
    cout << "\n";

    return 0;
}