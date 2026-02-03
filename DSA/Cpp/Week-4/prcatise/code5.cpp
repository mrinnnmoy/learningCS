#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

long long minimumTime(vector<int> &time, long long totalTrips)
{
    long long lo = 1;

    // Maximum possible time:
    // Worst case: slowest bus does all trips
    long long minTime = *min_element(time.begin(), time.end());
    long long hi = minTime * totalTrips;

    long long ans = hi;

    while (lo <= hi)
    {
        long long mid = lo + (hi - lo) / 2;

        // Calculate total trips possible in 'mid' time
        long long trips = 0;
        for (int t : time)
        {
            trips += mid / t;
            if (trips >= totalTrips)
                break; // prevent overflow
        }

        if (trips >= totalTrips)
        {
            ans = mid;
            hi = mid - 1; // try smaller time
        }
        else
        {
            lo = mid + 1; // need more time
        }
    }

    return ans;
}

int main()
{
    int n;
    long long totalTrips;

    cout << "Enter number of buses: ";
    cin >> n;

    vector<int> time(n);
    cout << "Enter time taken by each bus: ";
    for (int i = 0; i < n; i++)
        cin >> time[i];

    cout << "Enter total trips required: ";
    cin >> totalTrips;

    long long result = minimumTime(time, totalTrips);

    cout << "Minimum time required: " << result << endl;

    return 0;
}
