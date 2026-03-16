#include <iostream>
using namespace std;

int main()
{
    int arr[] = {3, 1, 4, 1, 5};
    int n = 5;

    int prefix[n];
    prefix[0] = arr[0];

    for (int i = 1; i < n; i++)
    {
        prefix[i] = prefix[i - 1] + arr[i];
    }

    // Queries
    int l = 1, r = 3;
    int sum;

    if (l == 0)
        sum = prefix[r];
    else
        sum = prefix[r] - prefix[l - 1];

    cout << "Sum from 1 to 3: " << sum << endl;

    l = 0;
    r = 4;

    if (l == 0)
        sum = prefix[r];
    else
        sum = prefix[r] - prefix[l - 1];

    cout << "Sum from 0 to 4: " << sum << endl;

    return 0;
}
