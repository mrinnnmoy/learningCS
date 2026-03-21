#include <iostream>
#include <vector>
using namespace std;

// Array 1: Every element twice except one → XOR all
int findSingle(vector<int> &arr)
{
    int result = 0;
    for (int x : arr)
        result ^= x;
    return result;
}

// Array 2: Every element three times except one
// Count set bits at each position, take mod 3
int findSingleInTriples(vector<int> &arr)
{
    int result = 0;
    // Check each of the 32 bit positions
    for (int i = 0; i < 32; i++)
    {
        int bitSum = 0;
        for (int x : arr)
            bitSum += (x >> i) & 1;
        // If bitSum % 3 != 0, the unique element has this bit set
        if (bitSum % 3 != 0)
            result |= (1 << i);
    }
    return result;
}

// Array 3: Every element twice except two → find both
pair<int, int> findTwoSingles(vector<int> &arr)
{
    // Step 1: XOR all → gives a ^ b
    int xorAll = 0;
    for (int x : arr)
        xorAll ^= x;

    // Step 2: Find any set bit in xorAll (rightmost set bit)
    // This bit differs between a and b
    int setBit = xorAll & (-xorAll);

    // Step 3: Divide elements into two groups by that bit
    // XOR each group separately → gives a and b
    int a = 0, b = 0;
    for (int x : arr)
    {
        if (x & setBit)
            a ^= x;
        else
            b ^= x;
    }
    return {a, b};
}

int main()
{
    // Array 1
    vector<int> arr1 = {4, 1, 2, 1, 2};
    cout << "Array 1 : ";
    for (int x : arr1)
        cout << x << " ";
    cout << "\nAnswer  : " << findSingle(arr1) << "\n\n";

    // Array 2
    vector<int> arr2 = {5, 5, 3, 5, 2, 3, 3};
    cout << "Array 2 : ";
    for (int x : arr2)
        cout << x << " ";
    cout << "\nAnswer  : " << findSingleInTriples(arr2) << "\n\n";

    // Array 3
    vector<int> arr3 = {1, 2, 3, 4, 1, 2};
    cout << "Array 3 : ";
    for (int x : arr3)
        cout << x << " ";
    auto [a, b] = findTwoSingles(arr3);
    cout << "\nAnswer  : " << a << " and " << b << "\n";

    return 0;
}