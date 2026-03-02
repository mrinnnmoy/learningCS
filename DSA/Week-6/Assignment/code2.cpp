#include <iostream>
#include <string>
using namespace std;

int main()
{
    string s;
    cout << "Enter a string: ";
    getline(cin, s);

    int left = 0;
    int right = s.length() - 1;
    bool isPalindrome = true;

    while (left < right)
    {
        char c1 = tolower(s[left]);
        char c2 = tolower(s[right]);

        if (c1 != c2)
        {
            isPalindrome = false;
            break;
        }

        left++;
        right--;
    }

    if (isPalindrome)
        cout << "Palindrome";
    else
        cout << "Not Palindrome";

    return 0;
}