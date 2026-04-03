# List of things learned.

## 1. Introduction to Priority Queue

A **Priority Queue** is an abstract data type similar to a regular queue, but with one key difference. Every element has a **priority** associated with it.

Elements are served based on their **priority**, not the order they were inserted.

- In a **Max Priority Queue** → element with the **highest** priority is served first
- In a **Min Priority Queue** → element with the **lowest** priority is served first

> 📷 **Priority Queue — elements served by priority, not insertion order:**
> ![Priority Queue](https://favtutor.com/resources/images/uploads/Priority_Queue_c++.png)

### Real-Life Analogies

```
Hospital Emergency Room:
  Patient A → sprained ankle  (priority = low)
  Patient B → heart attack    (priority = critical) ← served first
  Patient C → broken arm      (priority = medium)

CPU Task Scheduler:
  Task A → background sync    (priority = 1)
  Task B → user input         (priority = 10) ← runs first
  Task C → disk cleanup       (priority = 2)
```

### Applications of Priority Queue

- **Dijkstra's Shortest Path** : always process the closest unvisited node
- **Huffman Encoding** : always merge two lowest frequency nodes
- **CPU Scheduling** : highest priority process runs first
- **A\* Search Algorithm** : explore lowest cost path first
- **Heap Sort** : sort using heap property
- **Kth Largest/Smallest** : maintain a heap of size k
- **Merge K Sorted Lists** : always pick minimum among k pointers

---

## 2. Introduction to Heap

A **Heap** is the most common and efficient data structure used to implement a Priority Queue.

A Heap is a **Complete Binary Tree** that satisfies the **Heap Property**:

> 📷 **Heap — complete binary tree with heap ordering:**
> ![Heap](https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Max-Heap.svg/330px-Max-Heap.svg.png)

### Types of Heap

#### 1. Max Heap

Every parent node is **greater than or equal to** its children.
The **root** always holds the **maximum** element.

```
Max Heap:
            100
           /    \
         19      36
        /  \    /  \
       17   3  25   1
      /  \
     2    7

Root = 100 (maximum element)
Every parent > both children ✓
```

#### 2. Min Heap

Every parent node is **less than or equal to** its children.
The **root** always holds the **minimum** element.

```
Min Heap:
            1
           / \
          3   6
         / \ / \
        5  9 8  15
       / \
      17  21

Root = 1 (minimum element)
Every parent < both children ✓
```

### Key Properties of a Heap

- It is always a **Complete Binary Tree** (all levels filled left to right)
- It is **NOT** a sorted structure, only parent-child ordering is guaranteed
- Root is always the max (max heap) or min (min heap)
- Insertion and deletion are **O(log n)**
- Finding max/min is **O(1)**

---

## 3. Heap Representation using Array

The most efficient way to store a heap is using an **array**, no pointers needed.

Since a heap is a complete binary tree, we can map every node to an array index:

> 📷 **Heap Array Representation:**
> ![Heap Array](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Heap-as-array.svg/500px-Heap-as-array.svg.png)

```
Max Heap:
            100  (index 0)
           /    \
         19      36    (index 1, 2)
        /  \    /  \
       17   3  25   1  (index 3,4,5,6)

Array: [100, 19, 36, 17, 3, 25, 1]
Index:   0    1   2   3  4   5  6
```

### Index Formulas (0-indexed array)

```
Parent of node at index i     = (i - 1) / 2
Left child of node at index i = 2 * i + 1
Right child of node at index i= 2 * i + 2
```

### Verification

```
Node 19 is at index 1
  Parent      = (1-1)/2 = 0  → arr[0] = 100 ✓
  Left child  = 2*1+1   = 3  → arr[3] = 17  ✓
  Right child = 2*1+2   = 4  → arr[4] = 3   ✓
```

---

## 4. Heap Operations

### 4.1 Heapify Up (Bubble Up / Sift Up)

Used after **insertion**. A new element is added at the end of the array and then bubbled up to its correct position.

```
Insert 50 into Max Heap [100, 19, 36, 17, 3, 25, 1]:

Step 1: Add 50 at end
        [100, 19, 36, 17, 3, 25, 1, 50]
         Index of 50 = 7
         Parent = (7-1)/2 = 3 → arr[3] = 17

Step 2: 50 > 17 → swap
        [100, 19, 36, 50, 3, 25, 1, 17]
         Index of 50 = 3
         Parent = (3-1)/2 = 1 → arr[1] = 19

Step 3: 50 > 19 → swap
        [100, 50, 36, 19, 3, 25, 1, 17]
         Index of 50 = 1
         Parent = (1-1)/2 = 0 → arr[0] = 100

Step 4: 50 < 100 → stop

Final: [100, 50, 36, 19, 3, 25, 1, 17]
```

```cpp
void heapifyUp(vector<int>& heap, int index) {
    while (index > 0) {
        int parent = (index - 1) / 2;
        if (heap[parent] < heap[index]) {
            swap(heap[parent], heap[index]);
            index = parent;
        } else break;
    }
}

void insert(vector<int>& heap, int val) {
    heap.push_back(val);
    heapifyUp(heap, heap.size() - 1);
}
```

**Time Complexity:** O(log n) | At most log n swaps up the tree.

---

### 4.2 Heapify Down (Bubble Down / Sift Down)

Used after **deletion** of the root. The last element replaces the root and is then bubbled down.

```
Delete max (100) from Max Heap [100, 50, 36, 19, 3, 25, 1, 17]:

Step 1: Replace root with last element
        [17, 50, 36, 19, 3, 25, 1]
         Root = 17

Step 2: Compare 17 with children (50, 36)
        Larger child = 50 → 17 < 50 → swap
        [50, 17, 36, 19, 3, 25, 1]

Step 3: Compare 17 with children (19, 3)
        Larger child = 19 → 17 < 19 → swap
        [50, 19, 36, 17, 3, 25, 1]

Step 4: 17 is now at index 3
        Left child = index 7 → out of bounds → stop

Final: [50, 19, 36, 17, 3, 25, 1]
New max = 50 ✓
```

```cpp
void heapifyDown(vector<int>& heap, int index) {
    int n = heap.size();
    while (true) {
        int largest = index;
        int left    = 2 * index + 1;
        int right   = 2 * index + 2;

        if (left  < n && heap[left]  > heap[largest]) largest = left;
        if (right < n && heap[right] > heap[largest]) largest = right;

        if (largest != index) {
            swap(heap[index], heap[largest]);
            index = largest;
        } else break;
    }
}

int extractMax(vector<int>& heap) {
    if (heap.empty()) return -1;
    int maxVal = heap[0];
    heap[0]    = heap.back();
    heap.pop_back();
    heapifyDown(heap, 0);
    return maxVal;
}
```

**Time Complexity:** O(log n)

---

### 4.3 Build Heap from Array (Heapify)

Given an unordered array, convert it into a valid heap.

**Naive approach:** Insert elements one by one → O(n log n)

**Optimal approach (Floyd's Algorithm):** Start from the last non-leaf node and heapify down each node → **O(n)**

```
Array: [4, 10, 3, 5, 1]

Last non-leaf index = (n/2) - 1 = (5/2) - 1 = 1

Step 1: Heapify down index 1 (value=10)
        Children: 5, 1 → 10 > both → no swap
        [4, 10, 3, 5, 1]

Step 2: Heapify down index 0 (value=4)
        Children: 10, 3 → largest = 10 → swap
        [10, 4, 3, 5, 1]
        Now at index 1 → children: 5, 1 → largest = 5 → swap
        [10, 5, 3, 4, 1]

Final Max Heap: [10, 5, 3, 4, 1]
```

```cpp
void buildHeap(vector<int>& arr) {
    int n = arr.size();
    // Start from last non-leaf node going up to root
    for (int i = n / 2 - 1; i >= 0; i--)
        heapifyDown(arr, i);
}
```

**Time Complexity:** O(n) | Proven via mathematical summation

**Space Complexity:** O(1) | In-place

---

## 5. Complete Max Heap Implementation in C++

```cpp
#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

class MaxHeap {
private:
    vector<int> heap;

    void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[parent] < heap[index]) {
                swap(heap[parent], heap[index]);
                index = parent;
            } else break;
        }
    }

    void heapifyDown(int index) {
        int n = heap.size();
        while (true) {
            int largest = index;
            int left    = 2 * index + 1;
            int right   = 2 * index + 2;
            if (left  < n && heap[left]  > heap[largest]) largest = left;
            if (right < n && heap[right] > heap[largest]) largest = right;
            if (largest != index) {
                swap(heap[index], heap[largest]);
                index = largest;
            } else break;
        }
    }

public:
    // Insert a value
    void insert(int val) {
        heap.push_back(val);
        heapifyUp(heap.size() - 1);
    }

    // Get max without removing
    int getMax() {
        if (heap.empty()) throw runtime_error("Heap is empty");
        return heap[0];
    }

    // Remove and return max
    int extractMax() {
        if (heap.empty()) throw runtime_error("Heap is empty");
        int maxVal = heap[0];
        heap[0]    = heap.back();
        heap.pop_back();
        if (!heap.empty()) heapifyDown(0);
        return maxVal;
    }

    // Build heap from existing array
    void buildFromArray(vector<int> arr) {
        heap = arr;
        for (int i = heap.size() / 2 - 1; i >= 0; i--)
            heapifyDown(i);
    }

    bool isEmpty()  { return heap.empty(); }
    int  size()     { return heap.size();  }

    void display() {
        for (int x : heap) cout << x << " ";
        cout << "\n";
    }
};

int main() {
    MaxHeap mh;
    mh.insert(10); mh.insert(20);
    mh.insert(5);  mh.insert(30);
    mh.insert(15);

    cout << "Heap  : "; mh.display();
    cout << "Max   : " << mh.getMax()      << "\n";
    cout << "ExtMax: " << mh.extractMax()  << "\n";
    cout << "Heap  : "; mh.display();

    return 0;
}
```

**Output:**

```
Heap  : 30 20 5 10 15
Max   : 30
ExtMax: 30
Heap  : 20 15 5 10
```

---

## 6. Heap Sort

Heap Sort uses the heap data structure to sort an array.

**Algorithm:**

1. Build a Max Heap from the input array | O(n)
2. Repeatedly extract the max, placing it at the end | O(n log n)

> 📷 **Heap Sort — building heap then extracting max repeatedly:**
> ![Heap Sort](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Heapsort-example.gif/250px-Heapsort-example.gif)

```
Array: [4, 10, 3, 5, 1]

Step 1: Build Max Heap
        [10, 5, 3, 4, 1]

Step 2: Extract max (10), place at end
        [5, 4, 3, 1 | 10]

Step 3: Extract max (5), place before 10
        [4, 1, 3 | 5, 10]

Step 4: Extract max (4)
        [3, 1 | 4, 5, 10]

Step 5: Extract max (3)
        [1 | 3, 4, 5, 10]

Sorted: [1, 3, 4, 5, 10] ✓
```

```cpp
void heapSortDown(vector<int>& arr, int n, int i) {
    int largest = i;
    int left    = 2 * i + 1;
    int right   = 2 * i + 2;

    if (left  < n && arr[left]  > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapSortDown(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();

    // Step 1: Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapSortDown(arr, n, i);

    // Step 2: Extract elements one by one
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);          // Move current root to end
        heapSortDown(arr, i, 0);       // Heapify reduced heap
    }
}
```

**Time Complexity:** O(n log n) | Always, no best/worst case variation

**Space Complexity:** O(1) | In-place sorting

---

## 7. STL Priority Queue in C++

C++ STL provides `std::priority_queue` in `<queue>` header.

**By default it is a Max Heap.**

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    // ── Max Heap (default) ────────────────────
    priority_queue<int> maxPQ;

    maxPQ.push(10);
    maxPQ.push(30);
    maxPQ.push(20);
    maxPQ.push(5);

    cout << "Max PQ top: " << maxPQ.top() << "\n";   // 30
    maxPQ.pop();
    cout << "After pop : " << maxPQ.top() << "\n";   // 20

    // ── Min Heap ──────────────────────────────
    // Use greater<int> comparator
    priority_queue<int, vector<int>, greater<int>> minPQ;

    minPQ.push(10);
    minPQ.push(30);
    minPQ.push(20);
    minPQ.push(5);

    cout << "Min PQ top: " << minPQ.top() << "\n";   // 5
    minPQ.pop();
    cout << "After pop : " << minPQ.top() << "\n";   // 10

    return 0;
}
```

### STL Priority Queue Operations

| Operation   | Syntax         | Time Complexity |
| ----------- | -------------- | --------------- |
| Insert      | `pq.push(val)` | O(log n)        |
| Access top  | `pq.top()`     | O(1)            |
| Remove top  | `pq.pop()`     | O(log n)        |
| Check empty | `pq.empty()`   | O(1)            |
| Get size    | `pq.size()`    | O(1)            |

### Priority Queue with Custom Objects

```cpp
#include <iostream>
#include <queue>
#include <string>
using namespace std;

struct Task {
    string name;
    int    priority;

    // Comparator: higher priority value = higher priority
    bool operator<(const Task& other) const {
        return priority < other.priority;   // Max heap by priority
    }
};

int main() {
    priority_queue<Task> taskQueue;

    taskQueue.push({"Background Sync", 1});
    taskQueue.push({"User Input",      10});
    taskQueue.push({"Disk Cleanup",    2});
    taskQueue.push({"System Update",   5});

    cout << "Task execution order:\n";
    while (!taskQueue.empty()) {
        Task t = taskQueue.top(); taskQueue.pop();
        cout << "  " << t.name
             << " (priority=" << t.priority << ")\n";
    }
    return 0;
}
```

**Output:**

```
Task execution order:
  User Input      (priority=10)
  System Update   (priority=5)
  Disk Cleanup    (priority=2)
  Background Sync (priority=1)
```

---

## 8. Classic Heap Problems

### 8.1 Kth Largest Element

Find the Kth largest element in an unsorted array.

**Approach:** Use a **Min Heap of size K**.

- If heap size < k → push element
- If current element > heap top → pop and push

At the end, the top of min heap = Kth largest.

```
Array: [3, 2, 1, 5, 6, 4],  k = 2

Process 3: heap = [3]
Process 2: heap = [2, 3]
Process 1: heap size=2, 1 < top(2) → skip → heap=[2,3]
Process 5: heap size=2, 5 > top(2) → pop 2, push 5 → heap=[3,5]
Process 6: heap size=2, 6 > top(3) → pop 3, push 6 → heap=[5,6]
Process 4: heap size=2, 4 < top(5) → skip → heap=[5,6]

Top of min heap = 5 → 2nd largest ✓
```

```cpp
#include <queue>
#include <vector>
using namespace std;

int kthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> minHeap;

    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k)
            minHeap.pop();   // Remove smallest — keep only k largest
    }
    return minHeap.top();    // Top of min heap = kth largest
}
```

**Time Complexity:** O(n log k)

**Space Complexity:** O(k)

---

### 8.2 Kth Smallest Element

Find the Kth smallest element.

**Approach:** Use a **Max Heap of size K**.

- If current element < heap top → pop and push

```cpp
int kthSmallest(vector<int>& nums, int k) {
    priority_queue<int> maxHeap;   // Max heap

    for (int num : nums) {
        maxHeap.push(num);
        if (maxHeap.size() > k)
            maxHeap.pop();   // Remove largest — keep only k smallest
    }
    return maxHeap.top();    // Top of max heap = kth smallest
}
```

---

### 8.3 Merge K Sorted Arrays

Given K sorted arrays, merge them into one sorted array.

**Approach:** Use a min heap to always pick the smallest element across all arrays.

```
Arrays: [1,4,7], [2,5,8], [3,6,9]

Min Heap (val, array_index, element_index):
Initial: push first element of each → {(1,0,0),(2,1,0),(3,2,0)}

Extract min (1,0,0) → result=[1], push (4,0,1)
Heap: {(2,1,0),(3,2,0),(4,0,1)}

Extract min (2,1,0) → result=[1,2], push (5,1,1)
...

Final result: [1,2,3,4,5,6,7,8,9] ✓
```

```cpp
#include <queue>
#include <vector>
using namespace std;

vector<int> mergeKSorted(vector<vector<int>>& arrays) {
    // {value, array_index, element_index}
    priority_queue<
        tuple<int,int,int>,
        vector<tuple<int,int,int>>,
        greater<tuple<int,int,int>>
    > minHeap;

    // Push first element of each array
    for (int i = 0; i < arrays.size(); i++)
        if (!arrays[i].empty())
            minHeap.push({arrays[i][0], i, 0});

    vector<int> result;

    while (!minHeap.empty()) {
        auto [val, arrIdx, elemIdx] = minHeap.top();
        minHeap.pop();
        result.push_back(val);

        // Push next element from same array
        if (elemIdx + 1 < arrays[arrIdx].size())
            minHeap.push({arrays[arrIdx][elemIdx+1], arrIdx, elemIdx+1});
    }
    return result;
}
```

**Time Complexity:** O(n log k) where n = total elements, k = number of arrays

**Space Complexity:** O(k)

---

### 8.4 Top K Frequent Elements

Given an array, find the K most frequent elements.

```
Array: [1,1,1,2,2,3],  k=2

Frequencies: {1:3, 2:2, 3:1}

Min heap by frequency of size K:
Process (1,3): heap=[(1,3)]
Process (2,2): heap=[(2,2),(1,3)]
Process (3,1): heap size=2, 1 < top freq(2) → skip

Result: [1, 2] (top 2 frequent)
```

```cpp
#include <queue>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> topKFrequent(vector<int>& nums, int k) {
    // Count frequencies
    unordered_map<int, int> freq;
    for (int n : nums) freq[n]++;

    // Min heap by frequency: {frequency, value}
    priority_queue<
        pair<int,int>,
        vector<pair<int,int>>,
        greater<pair<int,int>>
    > minHeap;

    for (auto& [val, count] : freq) {
        minHeap.push({count, val});
        if (minHeap.size() > k) minHeap.pop();
    }

    vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top().second);
        minHeap.pop();
    }
    return result;
}
```

**Time Complexity:** O(n log k)

**Space Complexity:** O(n + k)

---

### 8.5 Running Median using Two Heaps

Find the median of a data stream as elements are added one by one.

**Idea:** Maintain two heaps:

- **Max heap** (left half) : stores the smaller half of numbers
- **Min heap** (right half) : stores the larger half of numbers
- Keep them balanced : sizes differ by at most 1

```
Stream: [5, 15, 1, 3, 2, 8, 7, 9, 10, 6, 11, 4]

After 5  : maxH=[5]        minH=[]      median=5
After 15 : maxH=[5]        minH=[15]    median=(5+15)/2=10
After 1  : maxH=[5,1]      minH=[15]    median=5
After 3  : maxH=[5,3,1]    minH=[15]    → rebalance
           maxH=[3,1]       minH=[5,15]  median=(3+5)/2=4
...
```

```cpp
#include <queue>
using namespace std;

class MedianFinder {
private:
    priority_queue<int>                          maxHeap; // left half
    priority_queue<int,vector<int>,greater<int>> minHeap; // right half

public:
    void addNum(int num) {
        // Always push to max heap first
        maxHeap.push(num);

        // Balance: max of left must be <= min of right
        if (!minHeap.empty() && maxHeap.top() > minHeap.top()) {
            minHeap.push(maxHeap.top());
            maxHeap.pop();
        }

        // Balance sizes: maxHeap can have at most 1 extra
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.push(maxHeap.top());
            maxHeap.pop();
        } else if (minHeap.size() > maxHeap.size()) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }
    }

    double findMedian() {
        if (maxHeap.size() == minHeap.size())
            return (maxHeap.top() + minHeap.top()) / 2.0;
        return maxHeap.top();   // maxHeap has the extra element
    }
};
```

**Time Complexity:** O(log n) per insertion, O(1) for median

**Space Complexity:** O(n)

---

## 9. Comparison: Heap vs Other Data Structures

| Operation        | Sorted Array | BST (balanced) | Heap        |
| ---------------- | ------------ | -------------- | ----------- |
| Insert           | O(n)         | O(log n)       | O(log n)    |
| Delete min/max   | O(1)         | O(log n)       | O(log n)    |
| Find min/max     | O(1)         | O(log n)       | O(1) ← best |
| Search arbitrary | O(log n)     | O(log n)       | O(n)        |
| Build from array | O(n log n)   | O(n log n)     | O(n) ← best |

> **Use a Heap when:** you only need repeated access to the min or max, not arbitrary elements.

> **Use a BST when:** you need search, sorted traversal, or range queries.

---

## 10. Time & Space Complexity Summary

| Operation            | Time       | Space |
| -------------------- | ---------- | ----- |
| Insert               | O(log n)   | O(1)  |
| Extract min/max      | O(log n)   | O(1)  |
| Peek min/max         | O(1)       | O(1)  |
| Build heap           | O(n)       | O(1)  |
| Heap Sort            | O(n log n) | O(1)  |
| Kth Largest/Smallest | O(n log k) | O(k)  |
| Merge K sorted       | O(n log k) | O(k)  |
| Running Median (add) | O(log n)   | O(n)  |
| Running Median (get) | O(1)       | O(1)  |

---

## 11. Important Tips & Common Mistakes

- **Max heap by default** in C++ STL, use `greater<int>` for min heap
- `pq.top()` does **not** remove the element, use `pq.pop()` after
- Heap is **not sorted**, only the root is guaranteed to be min/max
- For Kth largest → use **min heap of size k** (counterintuitive but correct)
- For Kth smallest → use **max heap of size k**
- Building heap with `buildHeap()` is **O(n)**, NOT O(n log n) — this is a common mistake
- Heap sort is always **O(n log n)** — no best/worst case variation
- Running median requires **two heaps**, this is a very common interview pattern
- Never use heap when you need to **search for arbitrary elements**, it's O(n)
- For custom objects, always define the comparator correctly, wrong comparator is a frequent bug

---

## Assignments.

---

1. **Max Heap from Scratch + Heap Sort.**

   **Task:** Implement a complete **Max Heap** class from scratch using an array (no STL heap functions). The class must support:
   - `insert(val)` : Insert element and heapify up
   - `extractMax()` : Remove and return max, heapify down
   - `getMax()` : Return max without removing
   - `display()` : Print the heap array
   - `size()` and `isEmpty()`

   Then use the same heapify logic to implement **Heap Sort** on a separate array.

   **Test with:**

   ```
   Insert: 10, 20, 5, 30, 15, 25, 1
   Display heap
   ExtractMax → should return 30
   Display heap after extraction
   HeapSort [4, 10, 3, 5, 1, 8, 2] → [1, 2, 3, 4, 5, 8, 10]
   ```

   [Solution](./Assignment/code1.cpp)

2. **STL Priority Queue Problems.**

   **Task:** Use `std::priority_queue` to solve the following three problems:

   **Part 1 : Kth Largest Element:**
   Find the Kth largest element in an unsorted array using a min heap of size K.

   **Part 2 : Top K Frequent Elements:**
   Given an array of integers, return the K most frequent elements.

   **Part 3 : Task Scheduler with Priority:**
   Given a list of tasks each with a name and priority level, execute them in priority order using a max priority queue with a custom comparator.

   **Test with:**

   ```
   Part 1:
   Array=[3,2,1,5,6,4], k=2    → 5
   Array=[3,2,3,1,2,4,5,5,6],k=4 → 4

   Part 2:
   Array=[1,1,1,2,2,3], k=2    → {1, 2}
   Array=[1,2,2,3,3,3], k=2    → {3, 2}

   Part 3:
   Tasks: {Send Email:3, Fix Bug:9, Write Docs:1,
           Deploy:7, Code Review:5}
   Execute in order of priority
   ```

   [Solution](./Assignment/code2.cpp)

3. **Running Median + Merge K Sorted Arrays.**

   **Task:** Solve both parts using heap-based approaches:

   **Part 1 : Running Median:**
   As numbers arrive in a stream one by one, after each insertion print the current median. Use two heaps (max heap for left half, min heap for right half).

   **Part 2 : Merge K Sorted Arrays:**
   Given K sorted arrays, merge them into one sorted array using a min heap. Print which array each extracted element came from to show the merge process.

   **Test with:**

   ```
   Part 1 — Stream:
   [5, 15, 1, 3, 2, 8, 7, 9, 10, 6, 11, 4]

   Expected medians after each insertion:
   5 → 5
   15 → 10
   1 → 5
   3 → 4
   2 → 3
   8 → 4
   7 → 5
   9 → 6
   10 → 7
   6 → 6.5
   11 → 7
   4 → 6.5

   Part 2 — Arrays:
   {1, 4, 7, 10}
   {2, 5, 8, 11}
   {3, 6, 9, 12}
   Expected output: 1 2 3 4 5 6 7 8 9 10 11 12
   ```

   [Solution](./Assignment/code3.cpp)
