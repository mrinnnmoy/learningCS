# List of things learned.

## 1. Introduction.

### What is a Greedy Algorithm?

A Greedy Algorithm is a problem-solving approach that makes the **locally optimal choice** at each step with the hope of finding the **global optimum**.

In simple words, at every decision point, a greedy algorithm picks the best available option without worrying about future consequences.

**Think of it like this:** If you're collecting coins on a path, a greedy approach always picks the largest coin visible right now, without planning ahead.

### How greedy differs from Recursion, Backtracking & DP.

| Approach            | Strategy                                    |
| ------------------- | ------------------------------------------- |
| Brute Force         | Try every possible solution                 |
| Backtracking        | Try all paths, undo bad choices             |
| Dynamic Programming | Solve all subproblems, reuse results        |
| Greedy              | Make the best local choice, never look back |

### When does greedy work? (Greedy Choice Property)

A greedy algorithm produces the correct answer only when the problem has **both** of the following properties:

**1. Greedy Choice Property:**
The globally optimal solution can be built by making locally optimal choices. Each greedy decision is safe and never needs to be revised.

**2. Optimal Substructure:**
The optimal solution to the problem contains optimal solutions to its subproblems. This property is shared with Dynamic Programming.

### When does greedy fail? (Counter examples)

Greedy fails when a locally optimal choice blocks a better global solution.

> 📷 **Greedy Failure — Picking highest node locally (12 → 6 → 9) misses the global best path (7 → 3 → 1 → 99):**
> ![Greedy Failure](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Greedy-search-path-example.gif/330px-Greedy-search-path-example.gif)

**Classic counter example — Coin Change:**

```
Denominations : {1, 3, 4}
Target        : 6

Greedy picks  : 4 + 1 + 1 = 3 coins
Optimal       : 3 + 3     = 2 coins
```

Greedy choose 4 first (locally best) but missed the globally optimal answer.
This is why Coin Change with arbitrary denominations requires Dynamic Programming.

<hr />

## 2. Properties of Greedy Algorithms.

### Greedy Choice Property

At each step, we make the choice that looks best at the moment. The key insight is that this local choice must be **provably safe** — meaning it will never lead us away from the global optimum.

The most common way to verify this is the **exchange argument**:

- Assume an optimal solution exists that differs from the greedy solution
- Show that swapping the optimal choice with the greedy choice does not worsen the solution
- Conclude that greedy is also optimal

### Optimal Substructure

A problem has optimal substructure if an optimal solution to the problem contains optimal solutions to its subproblems.

```
Example: Activity Selection

If we select activity A1 first, the remaining problem is:
"Find maximum activities from the remaining compatible activities"
This is the same problem on a smaller input — optimal substructure holds.
```

<hr />

## 3. General Greedy Framework

Almost every greedy problem follows this pattern:

```
Step 1 → Sort or organize the input
Step 2 → Iterate through the input
Step 3 → At each step, make the greedy choice
Step 4 → Check if the choice satisfies constraints
Step 5 → Add to solution and continue
```

> Why is sorting the most common first step?

> Because sorting reveals a natural processing order that makes the greedy choice obvious and provably correct.

<hr />

## 4. Classic Greedy Problems

### Activity Selection Problem.

- **Problem:** Given `n` activities with start and finish times, select the **maximum number of activities** that can be performed by a single person, assuming a person can only work on one activity at a time.

- **Greedy Idea:** Always pick the activity that **finishes earliest**. This leaves maximum time for remaining activities.

```
Example:
Activities : {(1,4), (3,5), (0,6), (5,7), (8,11), (8,12), (12,14)}
Sorted by finish time → same order above

Selected:
(1,4)  → finishes at 4,  select it
(3,5)  → starts at 3 < 4,  conflicts → skip
(0,6)  → starts at 0 < 4,  conflicts → skip
(5,7)  → starts at 5 >= 4, select it
(8,11) → starts at 8 >= 7, select it
(12,14)→ starts at 12 >= 11, select it

Maximum activities: 4
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Activity {
    int start, finish;
};

int activitySelection(vector<Activity>& activities) {
    sort(activities.begin(), activities.end(),
        [](Activity a, Activity b) {
            return a.finish < b.finish;
        });

    int count      = 1;
    int lastFinish = activities[0].finish;

    cout << "Selected activities:\n";
    cout << "(" << activities[0].start << ","
         << activities[0].finish << ") ";

    for (int i = 1; i < activities.size(); i++) {
        if (activities[i].start >= lastFinish) {
            cout << "(" << activities[i].start << ","
                 << activities[i].finish << ") ";
            lastFinish = activities[i].finish;
            count++;
        }
    }
    cout << "\n";
    return count;
}

int main() {
    vector<Activity> activities = {
        {1,4}, {3,5}, {0,6}, {5,7}, {8,11}, {8,12}, {12,14}
    };
    int result = activitySelection(activities);
    cout << "Maximum activities: " << result << "\n";
    return 0;
}
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(1)

### Fractional Knapsack Problem

- **Problem:** Given `n` items each with a weight and value, and a knapsack with capacity `W`, maximize the total value. Unlike 0/1 Knapsack, you can take **fractions** of items.

- **Greedy Idea:** Always pick the item with the **highest value-to-weight ratio**. If it doesn't fit fully, take the fraction that fits.

> 📷 **Knapsack — selecting items to maximize value within weight limit:**

> ![Fractional Knapsack](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Knapsack.svg/250px-Knapsack.svg.png)

- **Why 0/1 Knapsack needs DP:** When fractions aren't allowed, taking the highest ratio item might waste capacity and miss a better combination of whole items.

```
Example:
Items    : {(value=60, weight=10), (value=100, weight=20), (value=120, weight=30)}
Capacity : 50

Ratios   : 60/10=6.0,  100/20=5.0,  120/30=4.0

Take item 1 fully  : weight=10, value=60,  remaining=40
Take item 2 fully  : weight=20, value=100, remaining=20
Take 2/3 of item 3 : weight=20, value=80,  remaining=0

Total value = 240
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Item {
    int value, weight;
    double ratio;
};

double fractionalKnapsack(vector<Item>& items, int capacity) {
    sort(items.begin(), items.end(),
        [](Item a, Item b) { return a.ratio > b.ratio; });

    double totalValue = 0.0;
    int remaining     = capacity;

    for (auto& item : items) {
        if (remaining == 0) break;
        if (item.weight <= remaining) {
            totalValue += item.value;
            remaining  -= item.weight;
            cout << "Took full item  (v=" << item.value
                 << ", w=" << item.weight << ")\n";
        } else {
            double fraction = (double)remaining / item.weight;
            totalValue += item.value * fraction;
            cout << "Took " << fraction * 100 << "% of item"
                 << " (v=" << item.value << ", w=" << item.weight << ")\n";
            remaining = 0;
        }
    }
    return totalValue;
}

int main() {
    vector<Item> items = {{60,10,6.0},{100,20,5.0},{120,30,4.0}};
    double result = fractionalKnapsack(items, 50);
    cout << "Maximum value: " << result << "\n";
    return 0;
}
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(1)

### Job Sequencing Problem.

- **Problem:** Given a set of jobs, each with a deadline and profit, find the sequence of jobs that **maximizes total profit**. Each job takes exactly 1 unit of time.

- **Greedy Idea:** Sort jobs by profit **descending**. Assign each job to the **latest available slot** before its deadline.

```
Example:
Jobs sorted by profit: A(100,d=2) → C(27,d=2) → D(25,d=1) → B(19,d=1) → E(15,d=3)

Slot 2 ← A  →  slots: [-, -, A]
Slot 1 ← C  →  slots: [-, C, A]
Slot 1 taken → skip D
Slot 1 taken → skip B
Slot 3 ← E  →  slots: [-, C, A, E]

Total profit = 100 + 27 + 15 = 142
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Job { char id; int deadline, profit; };

void jobSequencing(vector<Job>& jobs) {
    sort(jobs.begin(), jobs.end(),
        [](Job a, Job b) { return a.profit > b.profit; });

    int maxDeadline = 0;
    for (auto& j : jobs) maxDeadline = max(maxDeadline, j.deadline);

    vector<char> slot(maxDeadline + 1, '-');
    vector<bool> slotFree(maxDeadline + 1, true);
    int totalProfit = 0, jobCount = 0;

    for (auto& job : jobs) {
        for (int t = job.deadline; t >= 1; t--) {
            if (slotFree[t]) {
                slot[t]     = job.id;
                slotFree[t] = false;
                totalProfit += job.profit;
                jobCount++;
                break;
            }
        }
    }

    cout << "Job sequence : ";
    for (int t = 1; t <= maxDeadline; t++)
        if (slot[t] != '-') cout << slot[t] << " ";
    cout << "\nTotal profit : " << totalProfit << "\n";
}

int main() {
    vector<Job> jobs = {{'A',2,100},{'B',1,19},{'C',2,27},{'D',1,25},{'E',3,15}};
    jobSequencing(jobs);
    return 0;
}
```

- **Time Complexity:** O(n²)
- **Space Complexity:** O(n)

### Coin Change Problem (Greedy version)

- **Problem:** Given coin denominations and a target amount, find the minimum number of coins using the **largest denomination first**.

> **Important:** Greedy only works for standard denominations like `{1, 5, 10, 25}`.
> For arbitrary denominations use DP instead.

```
Denominations : {1, 5, 10, 25}   Target: 41

Step 1: 41 >= 25 → take 25, remaining = 16
Step 2: 16 >= 10 → take 10, remaining = 6
Step 3: 6  >= 5  → take 5,  remaining = 1
Step 4: 1  >= 1  → take 1,  remaining = 0

Result: 4 coins ✓
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void coinChange(vector<int>& coins, int amount) {
    sort(coins.begin(), coins.end(), greater<int>());
    vector<int> result;
    int remaining = amount;

    for (int coin : coins)
        while (remaining >= coin) { result.push_back(coin); remaining -= coin; }

    if (remaining != 0) { cout << "Exact change not possible\n"; return; }
    cout << "Coins  : ";
    for (int c : result) cout << c << " ";
    cout << "\nTotal  : " << result.size() << " coins\n";
}

int main() {
    vector<int> coins = {1, 5, 10, 25};
    coinChange(coins, 41);
    return 0;
}
```

- **Time Complexity:** O(n log n + amount)
- **Space Complexity:** O(1)

<hr />

## 5. Greedy on Arrays

### Jump Game.

- **Problem:** Given an array where each element is the max jump length, can you **reach the last index**?

- **Greedy Idea:** Track the **farthest index reachable** at each step. If current index exceeds it, return false.

```
Array : [2, 3, 1, 1, 4]

i=0: maxReach = max(0, 0+2) = 2
i=1: maxReach = max(2, 1+3) = 4
i=2: maxReach = max(4, 2+1) = 4
i=3: maxReach = max(4, 3+1) = 4
Result: true ✓

Array : [3, 2, 1, 0, 4]
i=3: maxReach = 3, but i=4 > 3 → false ✗
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

bool canJump(vector<int>& nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > maxReach) return false;
        maxReach = max(maxReach, i + nums[i]);
    }
    return true;
}

int main() {
    vector<int> nums1 = {2, 3, 1, 1, 4};
    vector<int> nums2 = {3, 2, 1, 0, 4};
    cout << "[2,3,1,1,4]: " << (canJump(nums1) ? "Can reach end" : "Cannot") << "\n";
    cout << "[3,2,1,0,4]: " << (canJump(nums2) ? "Can reach end" : "Cannot") << "\n";
    return 0;
}
```

- **Time Complexity:** O(n)
- **Space Complexity:** O(1)

### Jump Game II

- **Problem:** Find the **minimum number of jumps** to reach the last index.

- **Greedy Idea:** At each boundary, jump to whichever position reaches **farthest**.

```
Array : [2, 3, 1, 1, 4]

currentEnd=0, farthest=0, jumps=0
i=0: farthest=2, i==currentEnd → jumps=1, currentEnd=2
i=1: farthest=4
i=2: farthest=4, i==currentEnd → jumps=2, currentEnd=4
Done! Min jumps = 2
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

int minJumps(vector<int>& nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < (int)nums.size() - 1; i++) {
        farthest = max(farthest, i + nums[i]);
        if (i == currentEnd) { jumps++; currentEnd = farthest; }
    }
    return jumps;
}

int main() {
    vector<int> nums1 = {2, 3, 1, 1, 4};
    vector<int> nums2 = {2, 3, 0, 1, 4};
    cout << "[2,3,1,1,4] → Min jumps: " << minJumps(nums1) << "\n";
    cout << "[2,3,0,1,4] → Min jumps: " << minJumps(nums2) << "\n";
    return 0;
}
```

- **Time Complexity:** O(n)
- **Space Complexity:** O(1)

<hr />

## 6. Greedy on Intervals

### Merge Intervals.

- **Problem:** Merge all **overlapping intervals** in a collection.

- **Greedy Idea:** Sort by start time. If current overlaps with last merged, extend it.

```
Input  : [1,3] [2,6] [8,10] [15,18]

[1,3]  → add                  result: [1,3]
[2,6]  → 2<=3, overlap→extend result: [1,6]
[8,10] → 8>6, no overlap→add  result: [1,6] [8,10]
[15,18]→ 15>10, add           result: [1,6] [8,10] [15,18]
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<pair<int,int>> mergeIntervals(vector<pair<int,int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<pair<int,int>> merged;
    merged.push_back(intervals[0]);

    for (int i = 1; i < (int)intervals.size(); i++) {
        if (intervals[i].first <= merged.back().second)
            merged.back().second = max(merged.back().second, intervals[i].second);
        else
            merged.push_back(intervals[i]);
    }
    return merged;
}

int main() {
    vector<pair<int,int>> intervals = {{1,3},{2,6},{8,10},{15,18}};
    auto result = mergeIntervals(intervals);
    cout << "Merged: ";
    for (auto& p : result)
        cout << "[" << p.first << "," << p.second << "] ";
    cout << "\n";
    return 0;
}
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(n)

### Minimum Platforms Problem.

- **Problem:** Find the **minimum number of platforms** needed so no train waits.

- **Greedy Idea:** Sort arrivals and departures separately. Two pointer — if next train arrives before current departs, need a new platform.

```
Sorted Arrivals  : 900  940  950  1100  1500  1800
Sorted Departures: 910  1120 1130 1200  1900  2000

900  arrives → platforms=1
940  arrives → platforms=2
950  arrives → platforms=3  ← max
910  departs → platforms=2
1100 arrives → platforms=3  ← max again
...
Answer: 3 platforms
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int minPlatforms(vector<int>& arr, vector<int>& dep) {
    sort(arr.begin(), arr.end());
    sort(dep.begin(), dep.end());

    int platforms = 1, maxPlatforms = 1;
    int i = 1, j = 0;

    while (i < arr.size() && j < dep.size()) {
        if (arr[i] <= dep[j]) { platforms++; i++; }
        else                  { platforms--; j++; }
        maxPlatforms = max(maxPlatforms, platforms);
    }
    return maxPlatforms;
}

int main() {
    vector<int> arr = {900, 940, 950, 1100, 1500, 1800};
    vector<int> dep = {910, 1200, 1120, 1130, 1900, 2000};
    cout << "Minimum platforms: " << minPlatforms(arr, dep) << "\n";
    return 0;
}
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(1)

<hr />

## 7. Greedy on Strings

### Largest Number from Array

- **Problem:** Arrange integers to form the **largest possible number**.

- **Greedy Idea:** Custom comparator — place `a` before `b` if string `ab > ba`.

```
Numbers: {3, 30, 34, 5, 9}

"9"  vs "5"   → "95"  > "59"  → 9 first
"5"  vs "34"  → "534" > "345" → 5 first
"34" vs "3"   → "343" > "334" → 34 first
"3"  vs "30"  → "330" > "303" → 3 first

Result: "9534330"
```

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

string largestNumber(vector<int>& nums) {
    vector<string> strs;
    for (int n : nums) strs.push_back(to_string(n));

    sort(strs.begin(), strs.end(),
        [](string& a, string& b) { return (a + b) > (b + a); });

    if (strs[0] == "0") return "0";
    string result = "";
    for (string& s : strs) result += s;
    return result;
}

int main() {
    vector<int> nums1 = {3, 30, 34, 5, 9};
    vector<int> nums2 = {10, 2};
    cout << "3 30 34 5 9 → " << largestNumber(nums1) << "\n";
    cout << "10 2        → " << largestNumber(nums2) << "\n";
    return 0;
}
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(n)

<hr />

## 8. Huffman Encoding (Concept Level)

Huffman Encoding assigns **shorter binary codes to frequent characters** and **longer codes to rare ones** — a lossless compression algorithm.

**Greedy Idea:** Use a **min-heap**. Always merge the two nodes with **lowest frequency** first.

> 📷 **Huffman Tree — optimal prefix codes built from character frequencies:**
> ![Huffman Tree](https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Huffman_tree_2.svg/500px-Huffman_tree_2.svg.png)

```
Characters : {a:5, b:9, c:12, d:13, e:16, f:45}

Step 1: Merge a(5)+b(9)   = 14
Step 2: Merge 14+c(12)    = 26
Step 3: Merge d(13)+e(16) = 29
Step 4: Merge 26+29       = 55
Step 5: Merge 55+f(45)    = 100 (root)

Final codes:
f → 0      (1 bit  — most frequent)
c → 100    (3 bits)
d → 1010   (4 bits)
e → 1011   (4 bits)
a → 11000  (5 bits)
b → 11001  (5 bits — least frequent)
```

- **Time Complexity:** O(n log n)
- **Space Complexity:** O(n)

<hr />

## 9. Time & Space Complexity Summary.

| Problem              | Time Complexity | Space Complexity |
| -------------------- | --------------- | ---------------- |
| Activity Selection   | O(n log n)      | O(1)             |
| Fractional Knapsack  | O(n log n)      | O(1)             |
| Job Sequencing       | O(n²)           | O(n)             |
| Coin Change (greedy) | O(n log n)      | O(1)             |
| Jump Game            | O(n)            | O(1)             |
| Jump Game II         | O(n)            | O(1)             |
| Merge Intervals      | O(n log n)      | O(n)             |
| Minimum Platforms    | O(n log n)      | O(1)             |
| Largest Number       | O(n log n)      | O(n)             |
| Huffman Encoding     | O(n log n)      | O(n)             |

<hr />

## 10. How to Identify a Greedy Problem

- Can I make one decision at a time without reconsidering past decisions?
- Does sorting the input in some order make the right choice obvious?
- Can I prove with an exchange argument that the greedy choice is safe?
- Does a locally optimal choice at each step guarantee a globally optimal result?

```
If all YES   → Use Greedy
If unsure    → Try a small counterexample
If it fails  → Use Dynamic Programming (Week-20)
```

<hr />

## Assignment.

1. Given `n` activities with start and finish times, select the maximum number of non-overlapping activities a single person can perform. Print the selected activities and the total count.

   ```
   Test with:

   Activities: {(1,4), (3,5), (0,6), (5,7), (3,8), (5,9), (6,10), (8,11), (8,12), (2,13), (12,14)}
   ```

   ```
   Output:

   Selected Activities:
   --------------------
   Activity 1  → start=1,  finish=4
   Activity 4  → start=5,  finish=7
   Activity 8  → start=8,  finish=11
   Activity 11 → start=12, finish=14

   Total selected: 4
   ```

   [Solution](./Assignment/code1.cpp)

2. Solve both problems and print detailed steps:
   - **Part 1 — Fractional Knapsack:** Given items with weights and values and a capacity W, maximize the total value. Print each item taken and what fraction was used.
   - **Part 2 — Job Sequencing:** Given jobs with deadlines and profits, find the job sequence that maximizes total profit. Print the final slot assignment.

   ```
   Test with:

   Knapsack:
   Items    : {(v=60,w=10), (v=100,w=20), (v=120,w=30), (v=80,w=15)}
   Capacity : 50

   Job Sequencing:
   Jobs: {A(profit=100,deadline=2), B(profit=19,deadline=1),
           C(profit=27,deadline=2),  D(profit=25,deadline=1),
           E(profit=15,deadline=3)}
   ```

   ```
   Fractional Knapsack (capacity=50):
   ----------------------------------------------
   Item 1 → took 100% | v=60  w=10 ratio=6   | remaining capacity=40
   Item 4 → took 100% | v=80  w=15 ratio=5.33| remaining capacity=25
   Item 2 → took 100% | v=100 w=20 ratio=5   | remaining capacity=5
   Item 3 → took 16.67%| v=120 w=30 ratio=4  | remaining capacity=0
   Max value = 260

   Job Sequencing:
   ----------------------------------------------
   Job A (profit=100, deadline=2) → assigned to slot 2
   Job C (profit=27,  deadline=2) → assigned to slot 1
   Job D (profit=25,  deadline=1) → no slot available, skipped
   Job B (profit=19,  deadline=1) → no slot available, skipped
   Job E (profit=15,  deadline=3) → assigned to slot 3

   Final slots : Slot1=C Slot2=A Slot3=E
   Jobs done   : 3
   Total profit: 142
   ```

   [Solution](./Assignment/code2.cpp)

3. Solve all three in one program:
   - **Part 1 — Merge Intervals:** Given overlapping intervals, merge them and print before and after.
   - **Part 2 — Minimum Platforms:** Given train arrival and departure times, find minimum platforms needed. Print the step-by-step platform count changes.
   - **Part 3 — Jump Game II:** Given an array of jump lengths, find the minimum number of jumps to reach the last index. Print which index you jump from and to at each step.

   ```
   Test with:
   Intervals : {[1,3],[2,6],[8,10],[9,11],[15,18],[16,20]}
   Trains    : arrivals={900,940,950,1100,1500,1800}
               departures={910,1200,1120,1130,1900,2000}
   Jump Array: {2,3,1,1,4,2,1,3,1}
   ```

   ```
   Output:
   Merge Intervals:
   ----------------------------------------------
   Input  : [1,3] [2,6] [8,10] [9,11] [15,18] [16,20]
   [2,6]  overlaps with [1,3]   → merging
   [8,10] no overlap             → add new
   [9,11] overlaps with [8,10]  → merging
   [15,18]no overlap             → add new
   [16,20]overlaps with [15,18] → merging
   Output : [1,6] [8,11] [15,20]

   Minimum Platforms:
   ----------------------------------------------
   Train arrives  at 900  → platforms=1
   Train arrives  at 940  → platforms=2
   Train arrives  at 950  → platforms=3
   Train departs  at 910  → platforms=2
   Train arrives  at 1100 → platforms=3
   Train departs  at 1120 → platforms=2
   Train departs  at 1130 → platforms=1
   Train departs  at 1200 → platforms=0
   Train arrives  at 1500 → platforms=1
   Train arrives  at 1800 → platforms=2
   Minimum platforms needed: 3

   Jump Game II:
   ----------------------------------------------
   Array : 2 3 1 1 4 2 1 3 1

   Jump 1 → from index 0, reach as far as index 2
   Jump 2 → from index 2, reach as far as index 5
   Jump 3 → from index 5, reach as far as index 8

   Minimum jumps to reach end: 3
   ```

   [Solution](./Assignment/code3.cpp)
