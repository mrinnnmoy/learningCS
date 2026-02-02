// 4! = 4*3*2*1 = 24

#include <iostream>
using namespace std;

int factorial(int n)
{
    if (n <= 1)
    {
        return n;
    }
    else
    {
        return n * factorial(n - 1);
    }
}

int main()
{
    int n;

    cout << "Enter a number to find factorial: ";
    cin >> n;

    if (n < 0)
    {
        cout << "Factorial is not possible." << endl;
    }
    else
    {
        cout << "Factorial of " << n << " is: " << factorial(n) << endl;
    }
    return 0;
}