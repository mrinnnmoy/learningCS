#include <iostream>
#include <vector>
using namespace std;

int main()
{

    vector<int> arr = {2, 3, 1, 2, 4, 3};
    int target = 7;

    int left = 0;
    int sum = 0;
    int minLen = arr.size() + 1;

    for (int right = 0; right < arr.size(); right++)
    {

        sum += arr[right];

        while (sum >= target)
        {

            minLen = min(minLen, right - left + 1);

            sum -= arr[left];
            left++;
        }
    }

    if (minLen == arr.size() + 1)
        cout << 0;
    else
        cout << minLen;
}