#include <iostream>
using namespace std;

// Function to check if a number is prime
bool isPrime(int n)
{
    if (n < 2)
        return false;
    if (n == 2)
        return true;
    if (n % 2 == 0)
        return false;

    for (int i = 3; i * i <= n; i += 2)
    {
        if (n % i == 0)
            return false;
    }
    return true;
}

int main()
{
    int L, R;
    cout << "Enter two integers: ";
    cin >> L >> R;

    int count = 0;
    int largestPrime = -1;

    cout << "All the Prime numbers between " << L << " & " << R << " are : ";

    for (int i = L; i <= R; i++)
    {
        if (isPrime(i))
        {
            cout << i << " ";
            count++;
            largestPrime = i;
        }
    }

    cout << endl;
    cout << "Count: " << count << endl;
    cout << "Largest Prime: " << largestPrime << endl;

    return 0;
}
