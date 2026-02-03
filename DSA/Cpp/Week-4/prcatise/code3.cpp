// Write a program in C++ to count pairs whose sum is less than target.

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

/*
  Function to count pairs whose sum is less than target
  Time Complexity: O(n log n) due to sorting
  Two pointer traversal: O(n)
*/

int countPairs(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());   // Step 1: Sort the array

    int left = 0;
    int right = nums.size() - 1;
    int count = 0;

    // Step 2: Two pointer traversal
    while (left < right) {
        int sum = nums[left] + nums[right];

        if (sum < target) {
            // All elements between left and right form valid pairs with nums[left]
            count += (right - left);
            left++;    // Move left pointer forward
        } else {
            right--;   // Decrease sum
        }
    }

    return count;
}

int main() {
    int n, target;

    cout << "Enter number of elements: ";
    cin >> n;

    vector<int> nums(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++)
        cin >> nums[i];

    cout << "Enter target: ";
    cin >> target;

    int result = countPairs(nums, target);

    cout << "Number of pairs whose sum is less than "
         << target << " is: " << result << endl;

    return 0;
}