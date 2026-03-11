#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main()
{

    int n;
    cin >> n;

    vector<int> arr(n);

    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }

    int x;
    cin >> x;

    auto lb = lower_bound(arr.begin(), arr.end(), x);
    auto ub = upper_bound(arr.begin(), arr.end(), x);

    int count = ub - lb;

    cout << count;

    return 0;
}