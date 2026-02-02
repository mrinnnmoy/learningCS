// A simple C++ program that demonstrates recursion using the classic Fibonacci definition:
// f(n) = f(n-1) + f(n-2)
// with base cases: f(0) = 0, f(1) = 1

#include <iostream>
using namespace std;

// Recursive function
int fib(int n)
{
    // Base cases
    if (n <= 1)
    {
        return n;
    }
    else
    {
        // Recursive case
        return fib(n - 1) + fib(n - 2);
    }
}

int main()
{
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Fibonacci value at position " << n << " is: " << fib(n) << endl;

    return 0;
}
