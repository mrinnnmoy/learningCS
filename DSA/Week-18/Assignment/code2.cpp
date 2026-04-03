#include <iostream>
#include <queue>
#include <vector>
#include <unordered_map>
#include <string>
using namespace std;

// ── Part 1: Kth Largest ───────────────────────
int kthLargest(vector<int> &nums, int k)
{
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int num : nums)
    {
        minHeap.push(num);
        if ((int)minHeap.size() > k)
            minHeap.pop();
    }
    return minHeap.top();
}

// ── Part 2: Top K Frequent ────────────────────
vector<int> topKFrequent(vector<int> &nums, int k)
{
    unordered_map<int, int> freq;
    for (int n : nums)
        freq[n]++;

    // Min heap by frequency
    priority_queue<
        pair<int, int>,
        vector<pair<int, int>>,
        greater<pair<int, int>>>
        minHeap;

    for (auto &[val, cnt] : freq)
    {
        minHeap.push({cnt, val});
        if ((int)minHeap.size() > k)
            minHeap.pop();
    }

    vector<int> result;
    while (!minHeap.empty())
    {
        result.push_back(minHeap.top().second);
        minHeap.pop();
    }
    return result;
}

// ── Part 3: Task Scheduler ────────────────────
struct Task
{
    string name;
    int priority;
    bool operator<(const Task &o) const
    {
        return priority < o.priority; // Max heap
    }
};

void taskScheduler(vector<Task> &tasks)
{
    priority_queue<Task> pq;
    for (auto &t : tasks)
        pq.push(t);

    cout << "Execution order:\n";
    int order = 1;
    while (!pq.empty())
    {
        Task t = pq.top();
        pq.pop();
        cout << "  " << order++ << ". "
             << t.name << " (priority=" << t.priority << ")\n";
    }
}

int main()
{
    // ── Part 1 ───────────────────────────────
    cout << "=== Part 1: Kth Largest ===\n";
    vector<int> a1 = {3, 2, 1, 5, 6, 4};
    vector<int> a2 = {3, 2, 3, 1, 2, 4, 5, 5, 6};
    cout << "Array1, k=2 → " << kthLargest(a1, 2) << "\n";
    cout << "Array2, k=4 → " << kthLargest(a2, 4) << "\n";

    // ── Part 2 ───────────────────────────────
    cout << "\n=== Part 2: Top K Frequent ===\n";
    vector<int> b1 = {1, 1, 1, 2, 2, 3};
    vector<int> b2 = {1, 2, 2, 3, 3, 3};

    auto printVec = [](vector<int> &v)
    {
        cout << "{ ";
        for (int x : v)
            cout << x << " ";
        cout << "}\n";
    };

    cout << "Array=[1,1,1,2,2,3], k=2 → ";
    auto r1 = topKFrequent(b1, 2);
    printVec(r1);

    cout << "Array=[1,2,2,3,3,3], k=2 → ";
    auto r2 = topKFrequent(b2, 2);
    printVec(r2);

    // ── Part 3 ───────────────────────────────
    cout << "\n=== Part 3: Task Scheduler ===\n";
    vector<Task> tasks = {
        {"Send Email", 3},
        {"Fix Bug", 9},
        {"Write Docs", 1},
        {"Deploy", 7},
        {"Code Review", 5}};
    taskScheduler(tasks);

    return 0;
}