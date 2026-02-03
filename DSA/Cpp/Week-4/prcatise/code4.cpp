#include <iostream>
#include <vector>
using namespace std;

class Solution
{
public:
    int findPeakElement(vector<int> &arr)
    {
        int n = arr.size();

        if (n == 1)
            return 0;

        int lo = 1, hi = n - 1;

        // Check if first element is peak
        if (arr[0] > arr[1])
            return 0;

        // Check if last element is peak
        if (arr[n - 1] > arr[n - 2])
            return n - 1;

        // Binary search in range [1, n-2]
        while (lo <= hi)
        {
            int mid = lo + (hi - lo) / 2;

            // Check if mid is peak
            if (arr[mid] > arr[mid - 1] && arr[mid] > arr[mid + 1])
                return mid;

            // If increasing slope, move right
            else if (arr[mid] > arr[mid - 1])
                lo = mid + 1;

            // If decreasing slope, move left
            else
                hi = mid - 1;
        }

        return -1; // Should never reach here
    }
};

int main()
{
    int n;
    cout << "Enter number of elements: ";
    cin >> n;

    vector<int> arr(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++)
        cin >> arr[i];

    Solution obj;
    int peakIndex = obj.findPeakElement(arr);

    cout << "Peak element found at index: " << peakIndex << endl;
    cout << "Peak value: " << arr[peakIndex] << endl;

    return 0;
}
