// Write a C++ program to implement Binary Search on a sorted array.
// The program should search for a given element and print its index if found.
// If the element is not present, print an appropriate message.

#include <iostream>
using namespace std;

int findIndex(int arr[], int n, int x)
{
    int lo = 0, hi = n - 1;

    while (lo <= hi)
    {
        int mid = (lo + hi) / 2;

        if (arr[mid] == x)
        {
            cout << "Element found at index " << mid << endl;
            return mid;
        }
        else if (arr[mid] < x)
        {
            lo = mid + 1;
        }
        else
        {
            hi = mid - 1;
        }
    }
    cout << "Element not found in array." << endl;
    return -1;
}

int main()
{
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int n = sizeof(arr) / sizeof(arr[0]);

    int x;
    cout << "Enter element to search: ";
    cin >> x;

    findIndex(arr, n, x);

    return 0;
}