#include <iostream>
using namespace std;

int main()
{
    int n;
    cout << "Enter number of rows: ";
    cin >> n;

    for (int i = 1; i <= n; i++)
    {

        // Spaces
        for (int j = 1; j <= n - i; j++)
        {
            cout << " ";
        }

        // Increasing numbers (1 to i)
        for (int j = 1; j <= i; j++)
        {
            cout << j;
        }

        // Decreasing numbers (i-1 to 1)
        for (int j = i - 1; j >= 1; j--)
        {
            cout << j;
        }

        cout << endl;
    }

    return 0;
}
