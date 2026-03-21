#include <iostream>
#include <vector>
using namespace std;

void printSubset(vector<int> &arr, int mask)
{
    cout << "{ ";
    bool empty = true;
    for (int i = 0; i < arr.size(); i++)
    {
        if ((mask >> i) & 1)
        {
            cout << arr[i] << " ";
            empty = false;
        }
    }
    if (empty)
        cout << "";
    cout << "}";
}

int subsetSum(vector<int> &arr, int mask)
{
    int sum = 0;
    for (int i = 0; i < arr.size(); i++)
        if ((mask >> i) & 1)
            sum += arr[i];
    return sum;
}

int subsetSize(int mask)
{
    return __builtin_popcount(mask);
}

int main()
{
    vector<int> arr = {1, 2, 3, 4};
    int n = arr.size();
    int total = (1 << n); // 2^n total subsets

    // ── All Subsets ──────────────────────────
    cout << "All Subsets (" << total << " total):\n";
    for (int mask = 0; mask < total; mask++)
    {
        printSubset(arr, mask);
        cout << "\n";
    }

    // ── Even Sum Subsets ─────────────────────
    cout << "\nEven Sum Subsets:\n";
    for (int mask = 0; mask < total; mask++)
    {
        if (subsetSum(arr, mask) % 2 == 0)
        {
            printSubset(arr, mask);
            cout << "\n";
        }
    }

    // ── Size-2 Subsets ───────────────────────
    cout << "\nSize-2 Subsets:\n";
    for (int mask = 0; mask < total; mask++)
    {
        if (subsetSize(mask) == 2)
        {
            printSubset(arr, mask);
            cout << "\n";
        }
    }

    return 0;
}