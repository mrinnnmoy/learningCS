// Write a C++ program for a given array of N elements and also a number k.
// Find if there are 2 elements, whose sum is equal to k.

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Binary search with index restriction
bool bs(vector<int> &nums, int target, int ignoreIndex)
{
    int lo = 0, hi = nums.size() - 1;

    while (lo <= hi)
    {
        int mid = (lo + hi) / 2;

        if (nums[mid] == target)
        {
            if (mid != ignoreIndex) // Ensure different element
                return true;
            else
            {
                // If same index, check neighbors
                if (mid - 1 >= lo && nums[mid - 1] == target)
                    return true;
                if (mid + 1 <= hi && nums[mid + 1] == target)
                    return true;
                return false;
            }
        }
        else if (nums[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }

    return false;
}

bool twoSum(vector<int> &nums, int k)
{
    sort(nums.begin(), nums.end());
    int n = nums.size();

    for (int i = 0; i < n; i++)
    {
        int target = k - nums[i];
        if (bs(nums, target, i))
            return true;
    }

    return false;
}

int main()
{
    int n, k;

    cout << "Enter number of elements: ";
    cin >> n;

    vector<int> nums(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++)
        cin >> nums[i];

    cout << "Enter target sum k: ";
    cin >> k;

    if (twoSum(nums, k))
        cout << "Yes, two elements exist whose sum is " << k << endl;
    else
        cout << "No such pair exists." << endl;

    return 0;
}
