#include <iostream>
#include <vector>
using namespace std;

int main()
{

    vector<int> arr = {1, 1, 2, 2, 3, 4, 4};

    int slow = 0;

    for (int fast = 1; fast < arr.size(); fast++)
    {

        if (arr[fast] != arr[slow])
        {
            slow++;
            arr[slow] = arr[fast];
        }
    }

    for (int i = 0; i <= slow; i++)
        cout << arr[i] << " ";
}