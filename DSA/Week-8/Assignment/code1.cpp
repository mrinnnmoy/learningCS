#include <iostream>
#include <set>
using namespace std;

int main()
{

    int arr[] = {4, 2, 7, 2, 4, 9, 1};
    int n = 7;

    set<int> uniqueNumbers;

    // Insert elements into set
    for (int i = 0; i < n; i++)
    {
        uniqueNumbers.insert(arr[i]);
    }

    // Print unique elements
    for (int num : uniqueNumbers)
    {
        cout << num << " ";
    }

    return 0;
}