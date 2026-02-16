#include <iostream>
using namespace std;

void modifyArray(int *arr, int n)
{
    for (int i = 0; i < n; i++)
    {
        *(arr + i) = *(arr + i) * 2;
    }
}

int main()
{
    int n;
    cout << "Enter size: ";
    cin >> n;

    int *arr = new int[n];

    cout << "Enter elements:\n";
    for (int i = 0; i < n; i++)
    {
        cin >> *(arr + i);
    }

    modifyArray(arr, n);

    cout << "Modified array: ";
    for (int i = 0; i < n; i++)
    {
        cout << *(arr + i) << " ";
    }

    delete[] arr;

    return 0;
}
