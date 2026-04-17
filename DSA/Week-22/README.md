# List of things learned.

## 1. Introduction to Segment Tree

A **Segment Tree** is a binary tree data structure used to efficiently answer **range queries** and perform **range updates** on an array.

Without a Segment Tree:

- Range sum query: O(n) per query
- Point update + re-query: O(n) again

With a Segment Tree:

- Range query: **O(log n)**
- Point update: **O(log n)**
- Build: **O(n)**

### Real-Life Use Cases

| Problem                                             | Query Type       |
| --------------------------------------------------- | ---------------- |
| Find sum of elements in range [l, r]                | Range Sum        |
| Find minimum/maximum in range [l, r]                | Range Min/Max    |
| Count inversions in array                           | Range Count      |
| Lazy range updates (add 5 to all elements in [l,r]) | Range Update     |
| Rectangle union area                                | 2D range queries |

---

## 2. Segment Tree. (Core Concept)

A Segment Tree divides the array into segments (intervals) and stores aggregate values (sum, min, max) for each segment.

```
Array: [1, 3, 5, 7, 9, 11]
Index:  0  1  2  3  4   5

Segment Tree (Sum):

                [0,5] = 36
               /              \
         [0,2] = 9        [3,5] = 27
         /      \          /       \
     [0,1]=4  [2,2]=5  [3,4]=16  [5,5]=11
     /     \            /    \
 [0,0]=1 [1,1]=3   [3,3]=7 [4,4]=9
```

### Key Properties

- The tree has **O(n)** nodes (at most 4n nodes for safety)
- Each leaf node represents a **single element**
- Each internal node represents the **aggregate of its children's range**
- Height of the tree = **O(log n)**

---

## 3. Segment Tree. (Array Representation)

Just like heaps, segment trees are stored in a 1-indexed array:

```
For node at index i:
  Left child  = 2 * i
  Right child = 2 * i + 1
  Parent      = i / 2

Node 1 = root = covers entire array [0, n-1]
```

```
Index in tree array:
          1: [0,5]=36
        /               \
    2: [0,2]=9       3: [3,5]=27
    /       \         /         \
4:[0,1]=4 5:[2,2]=5 6:[3,4]=16 7:[5,5]=11
  /    \              /      \
8:[0,0] 9:[1,1]   12:[3,3] 13:[4,4]
  =1      =3         =7       =9
```

---

## 4. Building a Segment Tree

```cpp
#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 100005;
int tree[4 * MAXN];
int arr[MAXN];

// Build segment tree for sum queries
void build(int node, int start, int end) {
    if (start == end) {
        // Leaf node — store the element
        tree[node] = arr[start];
        return;
    }

    int mid = (start + end) / 2;

    // Build left and right subtrees
    build(2 * node,     start, mid);
    build(2 * node + 1, mid+1, end);

    // Internal node = sum of children
    tree[node] = tree[2*node] + tree[2*node+1];
}

int main() {
    int n = 6;
    int a[] = {1, 3, 5, 7, 9, 11};
    for (int i = 0; i < n; i++) arr[i] = a[i];

    build(1, 0, n-1);

    // tree[1] = 36 (sum of all)
    // tree[2] = 9  (sum of [0,2])
    // tree[3] = 27 (sum of [3,5])
    cout << "Total sum: " << tree[1] << "\n";
    return 0;
}
```

**Time Complexity:** O(n)

**Space Complexity:** O(n) | but allocate 4n to be safe

---

## 5. Range Sum Query

Find the sum of elements in range [l, r].

### How It Works

```
Query sum [1, 4] on array [1,3,5,7,9,11]:

Start at root [0,5]:
  Query [1,4] partially overlaps [0,5]
  → recurse left [0,2] and right [3,5]

Left [0,2]:
  Query [1,4] partially overlaps [0,2]
  → recurse left [0,1] and right [2,2]

  Left [0,1]:
    Query [1,4] partially overlaps [0,1]
    → recurse left [0,0] and right [1,1]

    Left [0,0]: outside [1,4] → return 0
    Right [1,1]: fully inside [1,4] → return 3

  Right [2,2]: fully inside [1,4] → return 5

Right [3,5]:
  Query [1,4] partially overlaps [3,5]
  → recurse left [3,4] and right [5,5]

  Left [3,4]: fully inside [1,4] → return 16
  Right [5,5]: outside [1,4] → return 0

Total = 0 + 3 + 5 + 16 + 0 = 24 ✓
(arr[1]+arr[2]+arr[3]+arr[4] = 3+5+7+9 = 24)
```

### Three Cases in Every Query

```
1. Completely Outside  → return 0 (identity for sum)
2. Completely Inside   → return tree[node]
3. Partially Overlaps  → recurse on both children
```

```cpp
int query(int node, int start, int end, int l, int r) {
    // Case 1: Completely outside query range
    if (r < start || end < l)
        return 0;

    // Case 2: Completely inside query range
    if (l <= start && end <= r)
        return tree[node];

    // Case 3: Partially overlaps — recurse
    int mid = (start + end) / 2;
    int leftSum  = query(2*node,   start, mid, l, r);
    int rightSum = query(2*node+1, mid+1, end, l, r);
    return leftSum + rightSum;
}
```

**Time Complexity:** O(log n)

---

## 6. Point Update

Update a single element at index `idx` to value `val`.

```
Update arr[2] from 5 to 10:

Path from root to leaf [2,2]:
  [0,5]: old=36 → new=36+(10-5)=41
  [0,2]: old=9  → new=9+(10-5)=14
  [2,2]: old=5  → new=10

Only O(log n) nodes need updating.
```

```cpp
void update(int node, int start, int end, int idx, int val) {
    if (start == end) {
        // Leaf node — update value
        arr[idx]   = val;
        tree[node] = val;
        return;
    }

    int mid = (start + end) / 2;

    if (idx <= mid)
        update(2*node,   start, mid, idx, val);
    else
        update(2*node+1, mid+1, end, idx, val);

    // Recalculate internal node after child update
    tree[node] = tree[2*node] + tree[2*node+1];
}
```

**Time Complexity:** O(log n)

---

## 7. Range Minimum / Maximum Query

The same structure works for min and max — just change the merge operation.

```cpp
// For Range Minimum Query (RMQ)
void buildMin(int node, int start, int end) {
    if (start == end) {
        tree[node] = arr[start];
        return;
    }
    int mid = (start + end) / 2;
    buildMin(2*node,   start, mid);
    buildMin(2*node+1, mid+1, end);
    tree[node] = min(tree[2*node], tree[2*node+1]);   // ← min instead of +
}

int queryMin(int node, int start, int end, int l, int r) {
    if (r < start || end < l)
        return INT_MAX;   // Identity for min
    if (l <= start && end <= r)
        return tree[node];
    int mid = (start + end) / 2;
    return min(queryMin(2*node,   start, mid, l, r),
               queryMin(2*node+1, mid+1, end, l, r));
}
```

---

## 8. Lazy Propagation

**Problem:** What if we need to update a whole range [l, r] efficiently?

Without lazy propagation: O(n log n) for a range update
With lazy propagation: **O(log n)** for range update

### Concept

Instead of immediately updating all nodes in a range, we **mark the node as "lazy"**, meaning "_you have a pending update, apply it when needed_".

```
Array: [1, 1, 1, 1, 1]
Add 2 to range [0, 3]:

Without lazy:
  Update every leaf in [0,3] → 4 updates + recalculate parents

With lazy:
  Mark node covering [0,3] with lazy=2
  Only update that one node's sum: sum += 2*(3-0+1) = 8
  Propagate lazy value to children only when they are needed
```

```cpp
int lazyTree[4 * MAXN];   // Lazy array initialized to 0

void pushDown(int node, int start, int end) {
    if (lazyTree[node] != 0) {
        int mid = (start + end) / 2;

        // Apply lazy to left child
        tree[2*node]      += lazyTree[node] * (mid - start + 1);
        lazyTree[2*node]  += lazyTree[node];

        // Apply lazy to right child
        tree[2*node+1]     += lazyTree[node] * (end - mid);
        lazyTree[2*node+1] += lazyTree[node];

        // Clear lazy for current node
        lazyTree[node] = 0;
    }
}

// Range update: add val to all elements in [l, r]
void updateRange(int node, int start, int end,
                 int l, int r, int val) {
    if (r < start || end < l) return;   // Out of range

    if (l <= start && end <= r) {
        // Fully covered — update sum and mark lazy
        tree[node]     += val * (end - start + 1);
        lazyTree[node] += val;
        return;
    }

    pushDown(node, start, end);   // Push lazy before recursing

    int mid = (start + end) / 2;
    updateRange(2*node,   start, mid, l, r, val);
    updateRange(2*node+1, mid+1, end, l, r, val);
    tree[node] = tree[2*node] + tree[2*node+1];
}

// Range query with lazy propagation
int queryLazy(int node, int start, int end, int l, int r) {
    if (r < start || end < l) return 0;

    if (l <= start && end <= r) return tree[node];

    pushDown(node, start, end);   // Push lazy before recursing

    int mid = (start + end) / 2;
    return queryLazy(2*node,   start, mid, l, r) +
           queryLazy(2*node+1, mid+1, end, l, r);
}
```

**Time Complexity:** O(log n) for both range update and range query

**Space Complexity:** O(n)

---

## 9. Complete Segment Tree Class

```cpp
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

class SegmentTree {
private:
    int n;
    vector<int> tree, lazy;

    void build(vector<int>& arr, int node,
               int start, int end) {
        lazy[node] = 0;
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2*node,   start, mid);
        build(arr, 2*node+1, mid+1, end);
        tree[node] = tree[2*node] + tree[2*node+1];
    }

    void pushDown(int node, int start, int end) {
        if (lazy[node] != 0) {
            int mid = (start + end) / 2;
            tree[2*node]      += lazy[node] * (mid-start+1);
            lazy[2*node]      += lazy[node];
            tree[2*node+1]    += lazy[node] * (end-mid);
            lazy[2*node+1]    += lazy[node];
            lazy[node] = 0;
        }
    }

    void updateRange(int node, int start, int end,
                     int l, int r, int val) {
        if (r < start || end < l) return;
        if (l <= start && end <= r) {
            tree[node]  += val * (end-start+1);
            lazy[node]  += val;
            return;
        }
        pushDown(node, start, end);
        int mid = (start + end) / 2;
        updateRange(2*node,   start, mid, l, r, val);
        updateRange(2*node+1, mid+1, end, l, r, val);
        tree[node] = tree[2*node] + tree[2*node+1];
    }

    int queryRange(int node, int start, int end,
                   int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        pushDown(node, start, end);
        int mid = (start + end) / 2;
        return queryRange(2*node,   start, mid, l, r) +
               queryRange(2*node+1, mid+1, end, l, r);
    }

public:
    SegmentTree(vector<int>& arr) {
        n = arr.size();
        tree.assign(4*n, 0);
        lazy.assign(4*n, 0);
        build(arr, 1, 0, n-1);
    }

    void update(int l, int r, int val) {
        updateRange(1, 0, n-1, l, r, val);
    }

    int query(int l, int r) {
        return queryRange(1, 0, n-1, l, r);
    }
};

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTree st(arr);

    cout << "Sum [1,4]  = " << st.query(1, 4) << "\n";   // 24
    cout << "Sum [0,5]  = " << st.query(0, 5) << "\n";   // 36

    st.update(1, 3, 2);   // Add 2 to arr[1..3]
    cout << "After adding 2 to [1,3]:\n";
    cout << "Sum [0,5]  = " << st.query(0, 5) << "\n";   // 36+6=42
    cout << "Sum [1,3]  = " << st.query(1, 3) << "\n";   // 15+6=21

    return 0;
}
```

**Output:**

```
Sum [1,4]  = 24
Sum [0,5]  = 36
After adding 2 to [1,3]:
Sum [0,5]  = 42
Sum [1,3]  = 21
```

---

## 10. Introduction to Ordered Set (Policy-Based Data Structure)

C++ STL provides `std::set` and `std::multiset` for ordered storage — but they don't support **order statistics** like:

- Find kth smallest element in O(log n)
- Count elements less than x in O(log n)

For these, C++ has a **Policy-Based Ordered Set** available via GCC extensions.

```cpp
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;

// Ordered Set type definition
typedef tree<
    int,                       // Key type
    null_type,                 // Value type (null = set, not map)
    less<int>,                 // Comparator
    rb_tree_tag,               // Red-Black tree
    tree_order_statistics_node_update  // Enable order statistics
> ordered_set;
```

### Core Operations

| Operation         | Syntax                 | Time         | Description                              |
| ----------------- | ---------------------- | ------------ | ---------------------------------------- |
| Insert            | `os.insert(val)`       | O(log n)     | Insert element                           |
| Erase             | `os.erase(val)`        | O(log n)     | Remove element                           |
| Find              | `os.find(val)`         | O(log n)     | Find iterator                            |
| **find_by_order** | `os.find_by_order(k)`  | **O(log n)** | Iterator to kth element (0-indexed)      |
| **order_of_key**  | `os.order_of_key(val)` | **O(log n)** | Count of elements strictly less than val |

---

## 11. Ordered Set. (Operations in Detail)

### 11.1 find_by_order(k)

Returns an iterator to the kth element (0-indexed) in sorted order.

```cpp
ordered_set os;
os.insert(5);
os.insert(1);
os.insert(3);
os.insert(7);

// Sorted: 1, 3, 5, 7
// Index:  0  1  2  3

cout << *os.find_by_order(0) << "\n";  // 1 (0th smallest)
cout << *os.find_by_order(2) << "\n";  // 5 (2nd smallest)
cout << *os.find_by_order(3) << "\n";  // 7 (3rd smallest)
```

### 11.2 order_of_key(val)

Returns the number of elements strictly less than val.

```cpp
// Sorted: 1, 3, 5, 7
cout << os.order_of_key(1) << "\n";   // 0 (nothing < 1)
cout << os.order_of_key(4) << "\n";   // 2 (1 and 3 < 4)
cout << os.order_of_key(6) << "\n";   // 3 (1,3,5 < 6)
cout << os.order_of_key(8) << "\n";   // 4 (all < 8)
```

### 11.3 Full Example

```cpp
#include <iostream>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace std;
using namespace __gnu_pbds;

typedef tree<int, null_type, less<int>,
             rb_tree_tag,
             tree_order_statistics_node_update> ordered_set;

int main() {
    ordered_set os;
    os.insert(10);
    os.insert(20);
    os.insert(30);
    os.insert(40);
    os.insert(50);

    // Sorted: 10 20 30 40 50

    cout << "=== find_by_order ===\n";
    cout << "0th smallest: " << *os.find_by_order(0) << "\n"; // 10
    cout << "2nd smallest: " << *os.find_by_order(2) << "\n"; // 30
    cout << "4th smallest: " << *os.find_by_order(4) << "\n"; // 50

    cout << "\n=== order_of_key ===\n";
    cout << "Elements < 10: " << os.order_of_key(10) << "\n"; // 0
    cout << "Elements < 25: " << os.order_of_key(25) << "\n"; // 2
    cout << "Elements < 55: " << os.order_of_key(55) << "\n"; // 5

    cout << "\n=== Insert and update ===\n";
    os.insert(25);
    // Sorted: 10 20 25 30 40 50
    cout << "After inserting 25:\n";
    cout << "2nd smallest: " << *os.find_by_order(2) << "\n"; // 25
    cout << "Elements < 30: " << os.order_of_key(30) << "\n"; // 3

    os.erase(20);
    // Sorted: 10 25 30 40 50
    cout << "After erasing 20:\n";
    cout << "1st smallest: " << *os.find_by_order(1) << "\n"; // 25

    return 0;
}
```

**Output:**

```
=== find_by_order ===
0th smallest: 10
2nd smallest: 30
4th smallest: 50

=== order_of_key ===
Elements < 10: 0
Elements < 25: 2
Elements < 55: 5

=== Insert and update ===
After inserting 25:
2nd smallest: 25
Elements < 30: 3
After erasing 20:
1st smallest: 25
```

---

## 12. Ordered Multiset (Handling Duplicates)

Standard ordered_set doesn't support duplicates. To handle duplicates, use a coordinate compression trick: store pairs `{value, unique_id}`.

```cpp
#include <iostream>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace std;
using namespace __gnu_pbds;

typedef tree<pair<int,int>, null_type, less<pair<int,int>>,
             rb_tree_tag,
             tree_order_statistics_node_update> ordered_multiset;

int main() {
    ordered_multiset oms;
    int id = 0;

    // Insert duplicates using unique IDs
    oms.insert({5, id++});
    oms.insert({5, id++});
    oms.insert({3, id++});
    oms.insert({7, id++});
    oms.insert({5, id++});

    // Count elements strictly less than 5:
    // order_of_key({5, 0}) = position of first {5, ...}
    cout << "Elements < 5: "
         << oms.order_of_key({5, 0}) << "\n";   // 1 (only 3)

    // Count elements <= 5:
    // order_of_key({6, 0}) = position of first element >= 6
    cout << "Elements <= 5: "
         << oms.order_of_key({6, 0}) << "\n";   // 4 (3,5,5,5)

    // 2nd smallest (0-indexed)
    cout << "2nd smallest: "
         << (*oms.find_by_order(2)).first << "\n";  // 5

    return 0;
}
```

---

## 13. Classic Problems using Ordered Set

### 13.1 Count Inversions

An inversion is a pair (i, j) where i < j but arr[i] > arr[j].

```cpp
// Count inversions using ordered_set
long long countInversions(vector<int>& arr) {
    ordered_set os;
    long long inversions = 0;

    for (int x : arr) {
        // Elements already inserted that are greater than x
        // = total inserted - elements <= x
        // = os.size() - os.order_of_key(x+1)
        inversions += os.size() - os.order_of_key(x + 1);
        os.insert(x);
    }
    return inversions;
}
```

### 13.2 Kth Smallest in Dynamic Array

```cpp
ordered_set os;
// Insert elements
os.insert(10); os.insert(5); os.insert(20);
os.insert(1);  os.insert(15);

// Find 3rd smallest (0-indexed = index 2)
int k = 2;
cout << "3rd smallest: " << *os.find_by_order(k) << "\n";  // 10
```

### 13.3 Rank of Element

Find the rank (position) of an element in sorted order.

```cpp
// Rank = 1-indexed position in sorted order
int rank = os.order_of_key(val) + 1;
```

---

## 14. Segment Tree vs Ordered Set. (When to Use Which)

| Problem                       | Best Structure         |
| ----------------------------- | ---------------------- |
| Range sum/min/max queries     | Segment Tree           |
| Range updates + range queries | Segment Tree with Lazy |
| Kth smallest in dynamic set   | Ordered Set            |
| Count elements less than x    | Ordered Set            |
| Count inversions              | Ordered Set            |
| Range frequency count         | Segment Tree           |
| Point updates + range queries | Both work              |

---

## 15. Fenwick Tree (Binary Indexed Tree) — Concept

A **Fenwick Tree (BIT)** is a simpler alternative to Segment Tree for **prefix sum queries and point updates**.

```
More space-efficient: O(n) vs O(4n)
Faster constant factor
BUT: less flexible (harder to do range min/max, no lazy)
```

```cpp
int bit[MAXN];
int n;

// Add val to index i (1-indexed)
void update(int i, int val) {
    for (; i <= n; i += i & (-i))
        bit[i] += val;
}

// Prefix sum from 1 to i
int query(int i) {
    int sum = 0;
    for (; i > 0; i -= i & (-i))
        sum += bit[i];
    return sum;
}

// Range sum [l, r]
int rangeQuery(int l, int r) {
    return query(r) - query(l-1);
}
```

**Time:** O(log n) per update and query
**Space:** O(n)

---

## 16. Time & Space Complexity Summary

### Segment Tree

| Operation    | Without Lazy | With Lazy    |
| ------------ | ------------ | ------------ |
| Build        | O(n)         | O(n)         |
| Point update | O(log n)     | O(log n)     |
| Range update | O(n log n)   | **O(log n)** |
| Range query  | O(log n)     | O(log n)     |
| Space        | O(4n)        | O(4n)        |

### Ordered Set (Policy-Based)

| Operation        | Time     | Notes                    |
| ---------------- | -------- | ------------------------ |
| insert           | O(log n) | No duplicates by default |
| erase            | O(log n) |                          |
| find             | O(log n) |                          |
| find_by_order(k) | O(log n) | kth smallest             |
| order_of_key(x)  | O(log n) | count < x                |
| Space            | O(n)     |                          |

### Fenwick Tree vs Segment Tree

| Feature         | Fenwick Tree        | Segment Tree       |
| --------------- | ------------------- | ------------------ |
| Build           | O(n)                | O(n)               |
| Point update    | O(log n)            | O(log n)           |
| Range query     | O(log n)            | O(log n)           |
| Range update    | O(log n) with trick | O(log n) with lazy |
| Range min/max   | Not supported       | O(log n)           |
| Code complexity | Simple              | Moderate           |
| Space           | O(n)                | O(4n)              |

---

## 17. Important Tips & Common Mistakes

- Always allocate **4 × MAXN** for the segment tree array to avoid out-of-bounds
- Use **1-indexed** segment tree nodes (root = 1, children = 2i and 2i+1)
- In lazy propagation, **always call pushDown before recursing**. Forgetting this is the most common bug
- The identity element for sum queries is **0**, for min is **INT_MAX**, for max is **INT_MIN**
- Ordered set uses a **Red-Black tree** internally, all operations guaranteed O(log n)
- Ordered set does **not support duplicates**, use the `{value, id}` pair trick for multisets
- `find_by_order(k)` is **0-indexed**, the 1st smallest is at index 0
- `order_of_key(x)` counts elements **strictly less than** x, adjust by 1 if you need ≤
- Segment tree can handle any **associative** merge operations like sum, min, max, GCD, XOR, etc.
- For **competitive programming**, prefer `#include <ext/pb_ds/...>` for ordered sets over implementing a balanced BST manually

---

## Assignments

1. **Segment Tree: Range Sum + Point Update.**

   **Task:** Implement a Segment Tree that supports:
   - `build(arr)` : Build the segment tree from array
   - `query(l, r)` : Return sum of elements in range [l, r]
   - `update(idx, val)` : Update element at index idx to val
   - Print the segment tree array after building
   - Answer all queries and updates, printing results after each

   **Test with:**

   ```
   Array: [1, 3, 5, 7, 9, 11]   (0-indexed)

   Queries before update:
   query(0, 5) → 36
   query(1, 4) → 24
   query(2, 3) → 12
   query(0, 0) → 1

   Update:
   update(3, 10)  (change arr[3] from 7 to 10)

   Queries after update:
   query(0, 5) → 39
   query(1, 4) → 27
   query(3, 5) → 30
   ```

   [Solution](./Assignment/code1.cpp)

2. **Segment Tree with Lazy Propagation + Ordered Set Basics.**

   **Task:** Solve both parts:

   **Part 1 : Lazy Propagation:**
   Implement a Segment Tree with lazy propagation supporting:
   - Range update: add val to all elements in [l, r]
   - Range query: sum of [l, r]

   Test sequence:

   ```
   Array: [1, 2, 3, 4, 5]

   query(0, 4)       → 15
   update(1, 3, +3)  → add 3 to arr[1..3]
   query(0, 4)       → 24
   query(1, 3)       → 21
   update(0, 2, +2)  → add 2 to arr[0..2]
   query(0, 4)       → 30
   query(0, 2)       → 16
   ```

   **Part 2 : Ordered Set:**
   Use the policy-based ordered set to:
   - Insert elements one by one
   - After each insert, print the current kth smallest (k given per query)
   - Find rank of specific elements
   - Count elements less than given values

   Test:

   ```
   Insert sequence: 15, 5, 25, 10, 20, 30, 1

   Queries:
   find_by_order(0)      → 1st smallest
   find_by_order(3)      → 4th smallest
   order_of_key(15)      → elements < 15
   order_of_key(100)     → elements < 100
   After erase(10):
   find_by_order(2)      → 3rd smallest
   ```

   [Solution](./Assignment/code2.cpp)

3. **Range Min Query + Count Inversions + Kth Smallest in Stream.**

   **Task:** Solve all three parts:

   **Part 1 : Range Minimum Query (RMQ):**
   Build a Segment Tree for range minimum queries with point updates. Answer all queries and updates.

   **Part 2 : Count Inversions using Ordered Set:**
   Count the number of inversions in an array using the policy-based ordered set. An inversion is a pair (i, j) where i < j but arr[i] > arr[j].

   **Part 3 : Kth Smallest in a Stream:**
   Process a stream of insert/delete/query operations. For each query operation, print the kth smallest element currently in the set.

   **Test with:**

   ```
   Part 1 — RMQ:
   Array: [4, 3, 1, 6, 2, 9, 5]
   query(0, 6) → 1
   query(1, 5) → 2
   query(0, 2) → 1
   update(2, 8) → arr[2] becomes 8
   query(0, 2) → 3
   query(0, 6) → 2

   Part 2 — Inversions:
   [2, 4, 1, 3, 5]    → 3 inversions: (2,1),(4,1),(4,3)
   [5, 4, 3, 2, 1]    → 10 inversions
   [1, 2, 3, 4, 5]    → 0 inversions

   Part 3 — Stream:
   Operations: INSERT 5, INSERT 3, INSERT 8,
               QUERY 2 (2nd smallest → 5),
               INSERT 1, INSERT 7,
               QUERY 1 (1st smallest → 1),
               QUERY 3 (3rd smallest → 5),
               DELETE 3,
               QUERY 2 (2nd smallest → 5)
   ```

   [Solution](./Assignment/code3.cpp)
