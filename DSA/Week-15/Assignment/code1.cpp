#include <iostream>
#include <string>
using namespace std;

// Sum of all elements
int sumArray(int arr[], int n)
{
    if (n == 0)
        return 0;
    return arr[n - 1] + sumArray(arr, n - 1);
}

// Maximum element
int maxArray(int arr[], int n)
{
    if (n == 1)
        return arr[0];
    return max(arr[n - 1], maxArray(arr, n - 1));
}

// Check if sorted ascending
bool isSorted(int arr[], int n)
{
    if (n == 1)
        return true;
    if (arr[n - 2] > arr[n - 1])
        return false;
    return isSorted(arr, n - 1);
}

// Reverse string in-place
void reverseString(string &s, int l, int r)
{
    if (l >= r)
        return;
    swap(s[l], s[r]);
    reverseString(s, l + 1, r - 1);
}

// Check palindrome
bool isPalindrome(string &s, int l, int r)
{
    if (l >= r)
        return true;
    if (s[l] != s[r])
        return false;
    return isPalindrome(s, l + 1, r - 1);
}

// Count occurrences of character
int countOccurrence(string &s, char ch, int i)
{
    if (i == s.size())
        return 0;
    int count = (s[i] == ch) ? 1 : 0;
    return count + countOccurrence(s, ch, i + 1);
}

int main()
{
    int arr[] = {3, 1, 7, 2, 9, 4};
    int sorted[] = {1, 2, 3, 4, 5};
    string s1 = "recursion";
    string s2 = "madam";
    string str = "abracadabra";
    char ch = 'a';

    cout << "Sum of arr          : " << sumArray(arr, 6) << "\n";
    cout << "Max of arr          : " << maxArray(arr, 6) << "\n";
    cout << "Is arr sorted?      : " << (isSorted(arr, 6) ? "Yes" : "No") << "\n";
    cout << "Is sorted sorted?   : " << (isSorted(sorted, 5) ? "Yes" : "No") << "\n";

    reverseString(s1, 0, s1.size() - 1);
    cout << "Reverse of s1       : " << s1 << "\n";

    cout << "Is s2 palindrome?   : " << (isPalindrome(s2, 0, s2.size() - 1) ? "Yes" : "No") << "\n";
    cout << "Count of 'a' in str : " << countOccurrence(str, ch, 0) << "\n";

    return 0;
}