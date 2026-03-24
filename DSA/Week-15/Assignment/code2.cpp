#include <iostream>
#include <vector>
#include <string>
using namespace std;

// ── Part 1: All Subsets ───────────────────────
void generateSubsets(vector<int> &arr, vector<int> &current, int index)
{
    // Print current subset
    cout << "{";
    for (int i = 0; i < current.size(); i++)
    {
        if (i > 0)
            cout << " ";
        cout << current[i];
    }
    cout << "}\n";

    // Explore remaining elements
    for (int i = index; i < arr.size(); i++)
    {
        current.push_back(arr[i]);            // Choose
        generateSubsets(arr, current, i + 1); // Explore
        current.pop_back();                   // Unchoose (backtrack)
    }
}

// ── Part 2: All Permutations ──────────────────
int permCount = 0;

void generatePermutations(string &s, int start)
{
    if (start == s.size())
    {
        cout << s << "\n";
        permCount++;
        return;
    }

    for (int i = start; i < s.size(); i++)
    {
        swap(s[start], s[i]);               // Choose
        generatePermutations(s, start + 1); // Explore
        swap(s[start], s[i]);               // Unchoose (backtrack)
    }
}

int main()
{
    // ── Subsets ───────────────────────────────
    vector<int> arr = {1, 2, 3};
    vector<int> current;

    cout << "All Subsets of {1, 2, 3}:\n";
    cout << "--------------------------------\n";
    generateSubsets(arr, current, 0);
    cout << "Total: " << (1 << arr.size()) << "\n";

    // ── Permutations ──────────────────────────
    string s = "ABC";
    permCount = 0;

    cout << "\nAll Permutations of \"ABC\":\n";
    cout << "--------------------------------\n";
    generatePermutations(s, 0);
    cout << "Total: " << permCount << "\n";

    return 0;
}
