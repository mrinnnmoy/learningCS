#include <iostream>
#include <vector>
using namespace std;

int main()
{

    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};

    int left = 0;
    int right = height.size() - 1;

    int maxWater = 0;

    while (left < right)
    {

        int width = right - left;

        int h = min(height[left], height[right]);

        int area = width * h;

        maxWater = max(maxWater, area);

        if (height[left] < height[right])
            left++;
        else
            right--;
    }

    cout << maxWater;
}