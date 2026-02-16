#include <iostream>
using namespace std;

int main()
{
    int n;
    cout << "Enter size: ";
    cin >> n;

    int *arr = new int[n];

    cout << "Enter elements:\n";
    for (int i = 0; i < n; i++)
    {
        cin >> *(arr + i); // pointer arithmetic
    }

    int sum = 0;
    cout << "Array elements: ";
    for (int i = 0; i < n; i++)
    {
        cout << *(arr + i) << " ";
        sum += *(arr + i);
    }

    cout << "\nSum = " << sum << endl;

    delete[] arr; // Free memory

    return 0;
}
