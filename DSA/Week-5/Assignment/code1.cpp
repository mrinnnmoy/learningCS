#include <iostream>
using namespace std;

int main()
{
    int arr[] = {5, 1, 9, 3, 9, 7};
    int n = 6;

    if (n < 2)
    {
        cout << "Array must have at least 2 elements.";
        return 0;
    }

    int largest = arr[0];
    int secondLargest = -1; // assuming numbers are non-negative

    for (int i = 1; i < n; i++)
    {

        if (arr[i] > largest)
        {
            secondLargest = largest;
            largest = arr[i];
        }
        else if (arr[i] < largest && arr[i] > secondLargest)
        {
            secondLargest = arr[i];
        }
    }

    if (secondLargest == -1)
        cout << "No second largest element found.";
    else
        cout << "Second Largest: " << secondLargest;

    return 0;
}
