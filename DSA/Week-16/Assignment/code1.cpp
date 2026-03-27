#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Activity
{
    int start, finish, index;
};

void activitySelection(vector<Activity> &activities)
{
    // Sort by finish time
    sort(activities.begin(), activities.end(),
         [](Activity a, Activity b)
         {
             return a.finish < b.finish;
         });

    vector<Activity> selected;
    selected.push_back(activities[0]);
    int lastFinish = activities[0].finish;

    for (int i = 1; i < activities.size(); i++)
    {
        if (activities[i].start >= lastFinish)
        {
            selected.push_back(activities[i]);
            lastFinish = activities[i].finish;
        }
    }

    cout << "Selected Activities:\n";
    cout << "--------------------\n";
    for (auto &a : selected)
        cout << "Activity " << a.index
             << " → start=" << a.start
             << ", finish=" << a.finish << "\n";

    cout << "\nTotal selected: " << selected.size() << "\n";
}

int main()
{
    vector<Activity> activities = {
        {1, 4, 1}, {3, 5, 2}, {0, 6, 3}, {5, 7, 4}, {3, 8, 5}, {5, 9, 6}, {6, 10, 7}, {8, 11, 8}, {8, 12, 9}, {2, 13, 10}, {12, 14, 11}};

    activitySelection(activities);
    return 0;
}