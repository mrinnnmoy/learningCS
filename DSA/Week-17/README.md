# List of things learned.

## 1. Introduction to Trees

Before understanding Binary Trees, it is important to understand what a Tree data structure is.

A **Tree** is a non-linear, hierarchical data structure made up of nodes connected by edges.

Unlike arrays or linked lists which are linear, trees branch out — one node can connect to multiple nodes below it.

> **General Tree Structure:**
> ![Tree Structure](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Tree_%28computer_science%29.svg/330px-Tree_%28computer_science%29.svg.png)

### Tree Terminology

Understanding these terms is essential before diving into binary trees:

| Term        | Definition                           |
| ----------- | ------------------------------------ |
| **Node**    | Basic unit of a tree containing data |
| **Root**    | The topmost node with no parent      |
| **Parent**  | A node that has children below it    |
| **Child**   | A node directly below a parent       |
| **Leaf**    | A node with no children              |
| **Edge**    | The link connecting two nodes        |
| **Height**  | Longest path from root to any leaf   |
| **Depth**   | Distance from root to a given node   |
| **Level**   | Set of all nodes at the same depth   |
| **Subtree** | A node and all its descendants       |
| **Degree**  | Number of children a node has        |

```
Example Tree:
               A          ← Root (depth=0, level 0)
             /   \
            B     C       ← depth=1, level 1
           / \     \
          D   E     F     ← depth=2, level 2 (D,E,F are leaves)

Height of tree = 2
Degree of A    = 2
Degree of B    = 2
Degree of C    = 1
```

### Why Trees?

- Arrays/Linked Lists are O(n) for search, trees can do O(log n)
- Represent hierarchical data naturally (file systems, org charts, DOM)
- Foundation for more advanced structures (heaps, tries, segment trees)

---

## 2. Introduction to Binary Tree

A **Binary Tree** is a tree where every node has **at most two children**, called the **left child** and the **right child**.

> **Binary Tree — each node has at most 2 children:**
> ![Binary Tree](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Binary_tree_v2.svg/330px-Binary_tree_v2.svg.png)

```
         1
       /   \
      2     3
     / \   /
    4   5 6

Node 1 → left child = 2,  right child = 3
Node 2 → left child = 4,  right child = 5
Node 3 → left child = 6,  right child = NULL
Node 4 → leaf
Node 5 → leaf
Node 6 → leaf
```

### Node Structure in C++

```cpp
struct Node {
    int data;
    Node* left;
    Node* right;

    // Constructor
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};
```

### Types of Binary Trees.

#### 1. Full Binary Tree

Every node has either **0 or 2 children**. No node has exactly 1 child.

> 📷 **Full Binary Tree:**
> ![Full Binary Tree](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Full_binary.svg/250px-Full_binary.svg.png)

```
        1
       / \
      2   3
     / \
    4   5
```

#### 2. Complete Binary Tree

All levels are **fully filled except possibly the last** and the last level has all nodes as **far left as possible**.

> 📷 **Complete Binary Tree:**
> ![Complete Binary Tree](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Complete_binary2.svg/250px-Complete_binary2.svg.png)

```
        1
       / \
      2   3
     / \ /
    4  5 6
```

#### 3. Perfect Binary Tree

All internal nodes have **exactly 2 children** and all leaves are at the **same level**.

```
        1
       / \
      2   3
     / \ / \
    4  5 6  7
```

- Number of nodes at level k = 2^k
- Total nodes in perfect tree of height h = 2^(h+1) - 1

#### 4. Degenerate (Skewed) Binary Tree

Every node has **only one child**, essentially a linked list.

```
    1
     \
      2
       \
        3
         \
          4
```

- Right-skewed or Left-skewed
- Height = n-1 (worst case)
- Search becomes O(n), same as linked list

#### 5. Balanced Binary Tree

Height of left and right subtree of **every node** differs by at most 1.

```
        4
       / \
      2   6
     / \ / \
    1  3 5  7
```

- Guarantees O(log n) operations
- AVL trees and Red-Black trees are self-balancing variants

---

## 3. Binary Tree Implementation in C++

```cpp
#include <iostream>
#include <queue>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

class BinaryTree {
public:
    Node* root;
    BinaryTree() : root(nullptr) {}

    // Insert using level order (BFS) to keep tree complete
    void insert(int val) {
        Node* newNode = new Node(val);
        if (!root) { root = newNode; return; }

        queue<Node*> q;
        q.push(root);

        while (!q.empty()) {
            Node* curr = q.front(); q.pop();

            if (!curr->left) {
                curr->left = newNode;
                return;
            } else q.push(curr->left);

            if (!curr->right) {
                curr->right = newNode;
                return;
            } else q.push(curr->right);
        }
    }

    // Destructor to free memory
    void deleteTree(Node* node) {
        if (!node) return;
        deleteTree(node->left);
        deleteTree(node->right);
        delete node;
    }

    ~BinaryTree() { deleteTree(root); }
};
```

---

## 4. Tree Traversals

Tree traversal means visiting every node exactly once. There are two major categories:

### A. Depth First Search (DFS) Traversals

DFS goes **deep** into the tree before backtracking. There are three orders:

> 📷 **DFS Tree Traversal Orders:**
> ![Tree Traversal](https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Sorted_binary_tree_inorder.svg/330px-Sorted_binary_tree_inorder.svg.png)

#### 1. Inorder Traversal (Left → Root → Right)

Visit left subtree first, then root, then right subtree.

```
Tree:
        4
       / \
      2   6
     / \ / \
    1  3 5  7

Inorder: 1 → 2 → 3 → 4 → 5 → 6 → 7
```

> **Key Property:** Inorder traversal of a BST always gives sorted output.

```cpp
void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);          // Left
    cout << root->data << " ";    // Root
    inorder(root->right);         // Right
}
```

#### 2. Preorder Traversal (Root → Left → Right)

Visit root first, then left subtree, then right subtree.

```
Preorder: 4 → 2 → 1 → 3 → 6 → 5 → 7
```

Used for: copying a tree, serializing a tree structure.

```cpp
void preorder(Node* root) {
    if (!root) return;
    cout << root->data << " ";    // Root
    preorder(root->left);         // Left
    preorder(root->right);        // Right
}
```

#### 3. Postorder Traversal (Left → Right → Root)

Visit left subtree, then right subtree, then root last.

```
Postorder: 1 → 3 → 2 → 5 → 7 → 6 → 4
```

Used for: deleting a tree (delete children before parent), evaluating expression trees.

```cpp
void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);        // Left
    postorder(root->right);       // Right
    cout << root->data << " ";    // Root
}
```

### B. Breadth First Search (BFS). (Level Order Traversal)

Visit nodes **level by level** from left to right. Uses a **queue**.

```
Tree:
        1
       / \
      2   3
     / \   \
    4   5   6

Level Order: 1 → 2 → 3 → 4 → 5 → 6
```

```cpp
void levelOrder(Node* root) {
    if (!root) return;
    queue<Node*> q;
    q.push(root);

    while (!q.empty()) {
        Node* curr = q.front(); q.pop();
        cout << curr->data << " ";

        if (curr->left)  q.push(curr->left);
        if (curr->right) q.push(curr->right);
    }
}
```

### Traversal Complexity Summary

| Traversal   | Time | Space (best) | Space (worst skewed) |
| ----------- | ---- | ------------ | -------------------- |
| Inorder     | O(n) | O(log n)     | O(n)                 |
| Preorder    | O(n) | O(log n)     | O(n)                 |
| Postorder   | O(n) | O(log n)     | O(n)                 |
| Level Order | O(n) | O(n)         | O(n)                 |

---

## 5. Common Binary Tree Operations

### Height of a Binary Tree

Height = longest path from root to any leaf.

```cpp
int height(Node* root) {
    if (!root) return -1;           // -1 for edge count, 0 for node count
    int leftH  = height(root->left);
    int rightH = height(root->right);
    return 1 + max(leftH, rightH);
}
```

```
        1          height = 2
       / \
      2   3        height = 1
     / \
    4   5          height = 0 (leaves)
```

### Count Total Nodes

```cpp
int countNodes(Node* root) {
    if (!root) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}
```

### Count Leaf Nodes

```cpp
int countLeaves(Node* root) {
    if (!root) return 0;
    if (!root->left && !root->right) return 1;  // Leaf node
    return countLeaves(root->left) + countLeaves(root->right);
}
```

### Diameter of Binary Tree

Diameter = longest path between **any two nodes** (may or may not pass through root).

```
        1
       / \
      2   3
     / \
    4   5

Diameter = 3 (path: 4 → 2 → 1 → 3 or 5 → 2 → 1 → 3)
```

```cpp
int diameter(Node* root, int& maxDiam) {
    if (!root) return 0;
    int leftH  = diameter(root->left,  maxDiam);
    int rightH = diameter(root->right, maxDiam);
    maxDiam = max(maxDiam, leftH + rightH); // Path through current node
    return 1 + max(leftH, rightH);
}
```

### Mirror / Invert a Binary Tree

```cpp
Node* mirror(Node* root) {
    if (!root) return nullptr;
    swap(root->left, root->right);  // Swap children
    mirror(root->left);
    mirror(root->right);
    return root;
}
```

```
Before:         After:
    1               1
   / \             / \
  2   3           3   2
 / \               \ /
4   5             5   4
```

### Check if Two Trees are Identical

```cpp
bool isIdentical(Node* a, Node* b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (a->data == b->data)
        && isIdentical(a->left,  b->left)
        && isIdentical(a->right, b->right);
}
```

---

## 6. Binary Search Tree (BST)

A **Binary Search Tree** is a special binary tree that follows a strict ordering property:

> For every node N:
>
> - All values in the **left subtree** are **less than** N
> - All values in the **right subtree** are **greater than** N
> - Both left and right subtrees are also BSTs

> 📷 **Binary Search Tree — ordered structure:**
> ![BST](https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Binary_search_tree.svg/250px-Binary_search_tree.svg.png)

```
Valid BST:
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13

For node 8:
  Left subtree  {3,1,6,4,7}  → all < 8 ✓
  Right subtree {10,14,13}   → all > 8 ✓
```

### Why BST?

| Operation | Array (unsorted) | Array (sorted) | Linked List | BST (balanced) |
| --------- | ---------------- | -------------- | ----------- | -------------- |
| Search    | O(n)             | O(log n)       | O(n)        | O(log n)       |
| Insert    | O(1)             | O(n)           | O(1)        | O(log n)       |
| Delete    | O(n)             | O(n)           | O(n)        | O(log n)       |

---

## 7. BST Operations

### Insert

Start at root. Go left if value < current, go right if value > current. Insert at the empty spot found.

```
Insert 5 into BST:
        8                   8
       / \       →         / \
      3   10              3   10
                         / \
                        1   6
                           /
                          5
```

```cpp
Node* insert(Node* root, int val) {
    if (!root) return new Node(val);    // Found empty spot

    if (val < root->data)
        root->left  = insert(root->left,  val);
    else if (val > root->data)
        root->right = insert(root->right, val);
    // Duplicate values are ignored

    return root;
}
```

**Time Complexity:**

- Best/Average: O(log n), balanced tree
- Worst: O(n), skewed tree (inserting sorted data)

### Search

```cpp
Node* search(Node* root, int val) {
    if (!root || root->data == val) return root;

    if (val < root->data)
        return search(root->left,  val);
    else
        return search(root->right, val);
}
```

```
Search for 6 in BST:
  Start at 8 → 6 < 8  → go left
  At 3       → 6 > 3  → go right
  At 6       → found! ✓
```

### Find Minimum and Maximum

```cpp
// Minimum is always the leftmost node
Node* findMin(Node* root) {
    while (root->left) root = root->left;
    return root;
}

// Maximum is always the rightmost node
Node* findMax(Node* root) {
    while (root->right) root = root->right;
    return root;
}
```

### Delete

Deletion in BST has **three cases**:

> 📷 **BST Deletion — three cases:**
> ![BST Delete](https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Binary_search_tree_delete.svg/330px-Binary_search_tree_delete.svg.png)

```
Case 1 — Node is a leaf (no children):
  Simply remove it.

Case 2 — Node has one child:
  Replace node with its only child.

Case 3 — Node has two children:
  Find inorder successor (smallest in right subtree).
  Replace node's value with inorder successor's value.
  Delete the inorder successor.
```

```cpp
Node* deleteNode(Node* root, int val) {
    if (!root) return nullptr;

    if (val < root->data)
        root->left  = deleteNode(root->left,  val);
    else if (val > root->data)
        root->right = deleteNode(root->right, val);
    else {
        // Found the node to delete

        // Case 1 & 2: 0 or 1 child
        if (!root->left) {
            Node* temp = root->right;
            delete root;
            return temp;
        }
        if (!root->right) {
            Node* temp = root->left;
            delete root;
            return temp;
        }

        // Case 3: 2 children
        // Find inorder successor (min of right subtree)
        Node* successor = findMin(root->right);
        root->data      = successor->data;
        root->right     = deleteNode(root->right, successor->data);
    }
    return root;
}
```

### Check if a Binary Tree is a Valid BST

A common interview problem — verify the BST property holds for every node.

```cpp
bool isValidBST(Node* root, long long minVal, long long maxVal) {
    if (!root) return true;

    // Current node must be within valid range
    if (root->data <= minVal || root->data >= maxVal)
        return false;

    return isValidBST(root->left,  minVal,      root->data)
        && isValidBST(root->right, root->data,  maxVal);
}

// Call with:
// isValidBST(root, LLONG_MIN, LLONG_MAX)
```

---

## 8. BST — Important Derived Operations

### Inorder Successor & Predecessor

- **Inorder Successor** of node N = smallest node **greater than** N
- **Inorder Predecessor** of node N = largest node **smaller than** N

```
BST:
        8
       / \
      3   10
     / \    \
    1   6    14

Inorder successor of 6  = 8
Inorder predecessor of 6 = 4 (if it existed) or 3
```

```cpp
Node* inorderSuccessor(Node* root, Node* target) {
    Node* successor = nullptr;

    while (root) {
        if (target->data < root->data) {
            successor = root;          // Potential successor
            root = root->left;
        } else if (target->data > root->data) {
            root = root->right;
        } else {
            // Found target — successor is min of right subtree
            if (root->right)
                successor = findMin(root->right);
            break;
        }
    }
    return successor;
}
```

### Lowest Common Ancestor (LCA)

LCA of two nodes p and q is the deepest node that has both p and q as descendants.

```
LCA of 1 and 7 in BST above = 8
LCA of 1 and 6 = 3
LCA of 6 and 14 = 8
```

```cpp
Node* LCA(Node* root, int p, int q) {
    if (!root) return nullptr;

    // Both p and q are in left subtree
    if (p < root->data && q < root->data)
        return LCA(root->left, p, q);

    // Both p and q are in right subtree
    if (p > root->data && q > root->data)
        return LCA(root->right, p, q);

    // They are on different sides — current node is LCA
    return root;
}
```

### Kth Smallest Element in BST

Since inorder of BST gives sorted order, the kth element visited in inorder is the kth smallest.

```cpp
void kthSmallest(Node* root, int& k, int& result) {
    if (!root) return;

    kthSmallest(root->left, k, result);   // Go left first
    k--;
    if (k == 0) { result = root->data; return; }   // kth element found
    kthSmallest(root->right, k, result);
}
```

### Convert Sorted Array to Balanced BST

```cpp
Node* sortedArrayToBST(vector<int>& arr, int l, int r) {
    if (l > r) return nullptr;

    int mid   = (l + r) / 2;
    Node* root = new Node(arr[mid]);     // Middle element becomes root

    root->left  = sortedArrayToBST(arr, l,     mid - 1);
    root->right = sortedArrayToBST(arr, mid + 1, r);

    return root;
}
```

```
Array: {1, 2, 3, 4, 5, 6, 7}
Mid = 4 → root

Left  half {1,2,3} → mid=2 → left subtree
Right half {5,6,7} → mid=6 → right subtree

Result:
        4
       / \
      2   6
     / \ / \
    1  3 5  7
```

---

## 9. Iterative Traversals using Stack

Recursive traversals use the call stack implicitly. We can do them iteratively using an explicit stack.

### Iterative Inorder

```cpp
void iterativeInorder(Node* root) {
    stack<Node*> st;
    Node* curr = root;

    while (curr || !st.empty()) {
        // Go as far left as possible
        while (curr) { st.push(curr); curr = curr->left; }

        // Process node
        curr = st.top(); st.pop();
        cout << curr->data << " ";

        // Move to right subtree
        curr = curr->right;
    }
}
```

### Iterative Preorder

```cpp
void iterativePreorder(Node* root) {
    if (!root) return;
    stack<Node*> st;
    st.push(root);

    while (!st.empty()) {
        Node* curr = st.top(); st.pop();
        cout << curr->data << " ";

        // Push right first so left is processed first
        if (curr->right) st.push(curr->right);
        if (curr->left)  st.push(curr->left);
    }
}
```

---

## 10. Time & Space Complexity Summary

### Binary Tree Operations

| Operation            | Time Complexity | Space Complexity |
| -------------------- | --------------- | ---------------- |
| Insert (level order) | O(n)            | O(n)             |
| Search               | O(n)            | O(n)             |
| Height               | O(n)            | O(n)             |
| Count nodes          | O(n)            | O(n)             |
| All traversals       | O(n)            | O(n)             |

### BST Operations

| Operation    | Average Case | Worst Case (skewed) |
| ------------ | ------------ | ------------------- |
| Insert       | O(log n)     | O(n)                |
| Search       | O(log n)     | O(n)                |
| Delete       | O(log n)     | O(n)                |
| Find Min/Max | O(log n)     | O(n)                |
| LCA          | O(log n)     | O(n)                |
| Kth Smallest | O(log n + k) | O(n)                |

> The worst case O(n) for BST occurs when the tree becomes skewed (like inserting already sorted data). This is why **self-balancing BSTs** like AVL trees and Red-Black trees exist — they maintain O(log n) always.

---

## 11. Important Tips & Common Mistakes

- Always handle the `nullptr` base case first in recursive functions
- BST inorder always gives **sorted output**, use this property often
- For BST validation, pass **min/max bounds** down the recursion. Do NOT just check parent-child relationship
- When deleting a node with two children, always use **inorder successor** (min of right subtree)
- Balanced BST guarantees O(log n), skewed BST degrades to O(n)
- Height of an empty tree is conventionally **-1** (edge count) or **0** (node count). Be consistent
- Level order traversal always uses a **queue**, DFS traversals use **stack** (or recursion)
- For any path-based problem (diameter, LCA), think about **what information to pass up** the recursion

---

## Assignment.

1. **Binary Tree Inspector.**

   **Task:** Build a Binary Tree and implement the following operations. Print the result of each:
   - All four traversals: **Inorder, Preorder, Postorder, Level Order**
   - **Height** of the tree
   - **Total node count**
   - **Leaf node count**
   - **Mirror** the tree and print inorder after mirroring

   **Build this tree:**

   ```
        1
       / \
      2   3
     / \ / \
    4  5 6  7
   ```

   **Expected Output:**

   ```
   Inorder     : 4 2 5 1 6 3 7
   Preorder    : 1 2 4 5 3 6 7
   Postorder   : 4 5 2 6 7 3 1
   Level Order : 1 2 3 4 5 6 7
   Height      : 2
   Total Nodes : 7
   Leaf Nodes  : 4
   Inorder after mirror: 7 3 6 1 5 2 4
   ```

   [Solution](./Assignment/code1.cpp)

2. **Full BST Operations.**

   **Task:** Build a BST that supports the following operations. Print the tree state (inorder) after each modification:
   - `insert(val)` : Insert values one by one
   - `search(val)` : Search and report found/not found
   - `findMin()` and `findMax()`
   - `deleteNode(val)` : Handle all 3 deletion cases
   - `isValidBST()` : Verify the BST property
   - `kthSmallest(k)` : Find kth smallest element

   **Test sequence:**

   ```
   Insert: 8, 3, 10, 1, 6, 14, 4, 7, 13
   Search: 6        → found
   Search: 15       → not found
   findMin          → 1
   findMax          → 14
   kthSmallest(3)   → 4
   Delete 1    (leaf)
   Delete 3    (two children)
   Delete 10   (one child)
   isValidBST       → true
   ```

   [Solution](./Assignment/code2.cpp)

3. **Binary Tree Path Problems + BST Conversion.**

   **Task:** Solve all four parts using the tree structures below:

   **Part 1 : Diameter of Binary Tree:**
   Find the longest path between any two nodes. The path may or may not pass through root.

   **Part 2 : Root to Leaf Paths:**
   Print all paths from root to every leaf node.

   **Part 3 : Lowest Common Ancestor (LCA) in BST:**
   Given two values p and q, find their LCA in a BST.

   **Part 4 : Sorted Array to Balanced BST:**
   Convert `{1,2,3,4,5,6,7}` into a balanced BST. Print inorder and height to verify it's balanced.

   **Trees to use:**

   ```
   Binary Tree (Parts 1 & 2):
           1
          / \
         2   3
        / \   \
       4   5   6
      /
     7

   BST (Part 3):
           8
          / \
         3   10
        / \    \
       1   6    14
      / \   /
     4   7 13
   ```

   [Solution](./Assignment/code3.cpp)
