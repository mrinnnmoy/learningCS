#include <iostream>
#include <queue>
#include <vector>
using namespace std;

struct Pump
{
    int petrol;
    int distance;
};

int circularTour(vector<Pump> &pumps)
{
    int n = pumps.size();
    int totalNet = 0;   // Total net fuel across all pumps
    int currentNet = 0; // Net fuel from current starting point
    int startIndex = 0; // Candidate starting pump

    for (int i = 0; i < n; i++)
    {
        int net = pumps[i].petrol - pumps[i].distance;
        totalNet += net;
        currentNet += net;

        // If currentNet goes negative, current start is invalid
        // Reset: try starting from next pump
        if (currentNet < 0)
        {
            startIndex = i + 1;
            currentNet = 0;
        }
    }

    // If total net fuel is negative, no solution exists
    return (totalNet >= 0) ? startIndex : -1;
}

int main()
{
    // Test case 1
    vector<Pump> pumps1 = {{4, 6}, {6, 5}, {7, 3}, {4, 5}};
    cout << "Test 1:\n";
    cout << "Pumps (petrol, distance): ";
    for (auto p : pumps1)
        cout << "{" << p.petrol << "," << p.distance << "} ";
    cout << "\nStarting index = " << circularTour(pumps1) << "\n\n";

    // Test case 2
    vector<Pump> pumps2 = {{2, 3}, {3, 4}, {1, 2}};
    cout << "Test 2:\n";
    cout << "Pumps (petrol, distance): ";
    for (auto p : pumps2)
        cout << "{" << p.petrol << "," << p.distance << "} ";
    cout << "\nStarting index = " << circularTour(pumps2) << "\n";

    return 0;
}