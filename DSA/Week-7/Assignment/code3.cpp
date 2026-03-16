#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int> &arr, int target)
{

    int left = 0;
    int right = arr.size() - 1;

    while (left <= right)
    {

        int mid = (left + right) / 2;

        if (arr[mid] == target)
            return mid;

        else if (arr[mid] < target)
            left = mid + 1;

        else
            right = mid - 1;
    }

    return -1;
}

int main()
{

    int n;
    cin >> n;

    vector<int> arr(n);

    for (int i = 0; i < n; i++)
        cin >> arr[i];

    int x;
    cin >> x;

    cout << binarySearch(arr, x);

    return 0;
}