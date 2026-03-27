#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// ── Part 1: Fractional Knapsack ───────────────
struct Item
{
    int value, weight;
    double ratio;
    int index;
};

void fractionalKnapsack(vector<Item> &items, int capacity)
{
    sort(items.begin(), items.end(),
         [](Item a, Item b)
         { return a.ratio > b.ratio; });

    double totalValue = 0.0;
    int remaining = capacity;

    cout << "Fractional Knapsack (capacity=" << capacity << "):\n";
    cout << "----------------------------------------------\n";

    for (auto &item : items)
    {
        if (remaining == 0)
            break;

        if (item.weight <= remaining)
        {
            totalValue += item.value;
            remaining -= item.weight;
            cout << "Item " << item.index
                 << " → took 100% | v=" << item.value
                 << " w=" << item.weight
                 << " ratio=" << item.ratio
                 << " | remaining capacity=" << remaining << "\n";
        }
        else
        {
            double fraction = (double)remaining / item.weight;
            totalValue += item.value * fraction;
            cout << "Item " << item.index
                 << " → took " << fraction * 100 << "%"
                 << " | v=" << item.value
                 << " w=" << item.weight
                 << " ratio=" << item.ratio
                 << " | remaining capacity=0\n";
            remaining = 0;
        }
    }
    cout << "Max value = " << totalValue << "\n";
}

// ── Part 2: Job Sequencing ────────────────────
struct Job
{
    char id;
    int deadline, profit;
};

void jobSequencing(vector<Job> &jobs)
{
    sort(jobs.begin(), jobs.end(),
         [](Job a, Job b)
         { return a.profit > b.profit; });

    int maxDeadline = 0;
    for (auto &j : jobs)
        maxDeadline = max(maxDeadline, j.deadline);

    vector<char> slot(maxDeadline + 1, '-');
    vector<bool> slotFree(maxDeadline + 1, true);
    int totalProfit = 0, jobCount = 0;

    cout << "\nJob Sequencing:\n";
    cout << "----------------------------------------------\n";

    for (auto &job : jobs)
    {
        for (int t = job.deadline; t >= 1; t--)
        {
            if (slotFree[t])
            {
                slot[t] = job.id;
                slotFree[t] = false;
                totalProfit += job.profit;
                jobCount++;
                cout << "Job " << job.id
                     << " (profit=" << job.profit
                     << ", deadline=" << job.deadline
                     << ") → assigned to slot " << t << "\n";
                break;
            }
        }
        if (slotFree[job.deadline])
            cout << "Job " << job.id << " → no slot available, skipped\n";
    }

    cout << "\nFinal slots : ";
    for (int t = 1; t <= maxDeadline; t++)
        cout << "Slot" << t << "=" << slot[t] << " ";
    cout << "\nJobs done   : " << jobCount;
    cout << "\nTotal profit: " << totalProfit << "\n";
}

int main()
{
    // Part 1
    vector<Item> items = {
        {60, 10, 6.0, 1},
        {100, 20, 5.0, 2},
        {120, 30, 4.0, 3},
        {80, 15, 5.33, 4}};
    fractionalKnapsack(items, 50);

    // Part 2
    vector<Job> jobs = {
        {'A', 2, 100}, {'B', 1, 19}, {'C', 2, 27}, {'D', 1, 25}, {'E', 3, 15}};
    jobSequencing(jobs);

    return 0;
}