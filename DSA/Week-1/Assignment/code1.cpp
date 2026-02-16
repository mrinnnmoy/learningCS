#include <iostream>
using namespace std;

int main()
{
    long long N;
    cout << "Enter a positive integer: ";
    cin >> N;

    long long temp = N;
    int sum = 0;
    int digitCount = 0;
    long long reversed = 0;

    while (temp > 0)
    {
        // Extract last digit
        int digit = temp % 10;

        // Add to sum
        sum += digit;

        // Build reversed number
        reversed = reversed * 10 + digit;

        // Remove last digit
        temp /= 10;

        // Count digits
        digitCount++;
    }

    cout << "Sum of digits: " << sum << endl;
    cout << "Total number of digits: " << digitCount << endl;
    cout << "Reversed number: " << reversed << endl;

    return 0;
}