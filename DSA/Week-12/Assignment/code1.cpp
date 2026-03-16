#include <iostream>
#include <vector>
using namespace std;

int main()
{

    vector<int> arr = {1, 2, 3, 4, 6};
    int target = 6;

    int left = 0;
    int right = arr.size() - 1;

    while (left < right)
    {

        int sum = arr[left] + arr[right];

        if (sum == target)
        {
            cout << "Pair Found";
            return 0;
        }
        else if (sum < target)
            left++;

        else
            right--;
    }

    cout << "Pair Not Found";
}