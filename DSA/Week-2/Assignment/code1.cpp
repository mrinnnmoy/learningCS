#include <iostream>
using namespace std;

int main()
{
    int n;
    cout << "Enter number of rows: ";
    cin >> n;

    for (int i = 1; i <= n; i++)
    { // Rows
        for (int j = 1; j <= i; j++)
        { // Print row number i times
            cout << i << " ";
        }
        cout << endl;
    }

    return 0;
}
