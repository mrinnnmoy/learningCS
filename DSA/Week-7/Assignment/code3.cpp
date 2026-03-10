#include <iostream>
#include <unordered_map>
using namespace std;

int main()
{

    int arr[] = {4, 5, 1, 2, 0, 4, 1};
    int n = 7;

    unordered_map<int, int> freq;

    // Step 1: Count frequencies
    for (int i = 0; i < n; i++)
    {
        freq[arr[i]]++;
    }

    // Step 2: Find first element with frequency 1
    for (int i = 0; i < n; i++)
    {
        if (freq[arr[i]] == 1)
        {
            cout << arr[i];
            return 0;
        }
    }

    cout << "No unique element";

    return 0;
}