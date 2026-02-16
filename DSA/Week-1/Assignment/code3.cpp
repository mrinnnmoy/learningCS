#include <iostream>
using namespace std;

int main()
{
    long long N;
    cout << "Enter a number: ";
    cin >> N;

    int steps = 0;

    cout << "Sequence: " << N;

    // Repeat until N becomes a single digit
    while (N >= 10)
    {
        if (N % 2 == 0)
        {
            N = N / 2;
        }
        else
        {
            N = N * 3 + 1;
        }

        cout << " -> " << N;
        steps++;
    }

    cout << "\nTotal steps to reach a single digit: " << steps << endl;

    return 0;
}
