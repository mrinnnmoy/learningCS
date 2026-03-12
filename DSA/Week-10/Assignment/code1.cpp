#include <iostream>
#include <vector>
using namespace std;

int main()
{

    vector<int> arr = {1, 2, 3, 4, 5};
    int n = arr.size();

    vector<int> prefix(n);

    prefix[0] = arr[0];

    for (int i = 1; i < n; i++)
        prefix[i] = prefix[i - 1] + arr[i];

    int L = 1;
    int R = 3;

    int sum;

    if (L == 0)
        sum = prefix[R];
    else
        sum = prefix[R] - prefix[L - 1];

    cout << sum;
}