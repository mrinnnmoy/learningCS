#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Node
{
    int data;
    Node *left;
    Node *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

// ── Part 1: Diameter ──────────────────────────
int diameterHelper(Node *root, int &maxDiam)
{
    if (!root)
        return 0;
    int leftH = diameterHelper(root->left, maxDiam);
    int rightH = diameterHelper(root->right, maxDiam);
    // Path through current node = leftH + rightH
    maxDiam = max(maxDiam, leftH + rightH);
    return 1 + max(leftH, rightH);
}

int diameter(Node *root)
{
    int maxDiam = 0;
    diameterHelper(root, maxDiam);
    return maxDiam;
}

// ── Part 2: Root to Leaf Paths ────────────────
void rootToLeafPaths(Node *root, vector<int> &path)
{
    if (!root)
        return;

    path.push_back(root->data); // Add current node to path

    if (!root->left && !root->right)
    {
        // Leaf reached — print path
        for (int i = 0; i < path.size(); i++)
        {
            cout << path[i];
            if (i < path.size() - 1)
                cout << " → ";
        }
        cout << "\n";
    }

    rootToLeafPaths(root->left, path);
    rootToLeafPaths(root->right, path);

    path.pop_back(); // Backtrack
}

// ── Part 3: LCA in BST ────────────────────────
Node *LCA(Node *root, int p, int q)
{
    if (!root)
        return nullptr;
    if (p < root->data && q < root->data)
        return LCA(root->left, p, q);
    if (p > root->data && q > root->data)
        return LCA(root->right, p, q);
    return root; // Split point — this is the LCA
}

// ── Part 4: Sorted Array to Balanced BST ──────
Node *sortedArrayToBST(vector<int> &arr, int l, int r)
{
    if (l > r)
        return nullptr;
    int mid = (l + r) / 2;
    Node *root = new Node(arr[mid]);
    root->left = sortedArrayToBST(arr, l, mid - 1);
    root->right = sortedArrayToBST(arr, mid + 1, r);
    return root;
}

int height(Node *root)
{
    if (!root)
        return -1;
    return 1 + max(height(root->left), height(root->right));
}

void inorder(Node *root)
{
    if (!root)
        return;
    inorder(root->left);
    cout << root->data << " ";
    inorder(root->right);
}

void deleteTree(Node *root)
{
    if (!root)
        return;
    deleteTree(root->left);
    deleteTree(root->right);
    delete root;
}

int main()
{
    // ── Build Binary Tree (Parts 1 & 2) ──────
    Node *bt = new Node(1);
    bt->left = new Node(2);
    bt->right = new Node(3);
    bt->left->left = new Node(4);
    bt->left->right = new Node(5);
    bt->right->right = new Node(6);
    bt->left->left->left = new Node(7);

    // ── Part 1: Diameter ─────────────────────
    cout << "Part 1 — Diameter:\n";
    cout << "--------------------------------\n";
    cout << "Diameter = " << diameter(bt) << "\n";
    cout << "(Longest path: 7→4→2→1→3→6 = 5 edges)\n\n";

    // ── Part 2: Root to Leaf Paths ───────────
    cout << "Part 2 — Root to Leaf Paths:\n";
    cout << "--------------------------------\n";
    vector<int> path;
    rootToLeafPaths(bt, path);
    cout << "\n";

    deleteTree(bt);

    // ── Build BST (Part 3) ───────────────────
    Node *bst = nullptr;
    auto insertBST = [](Node *root, int val) -> Node *
    {
        if (!root)
            return new Node(val);
        if (val < root->data)
            root->left = nullptr; // placeholder
        return root;
    };

    // Build BST manually for clarity
    Node *bst2 = new Node(8);
    bst2->left = new Node(3);
    bst2->right = new Node(10);
    bst2->left->left = new Node(1);
    bst2->left->right = new Node(6);
    bst2->right->right = new Node(14);
    bst2->left->right->left = new Node(4);
    bst2->left->right->right = new Node(7);
    bst2->right->right->left = new Node(13);

    // ── Part 3: LCA ──────────────────────────
    cout << "Part 3 — LCA in BST:\n";
    cout << "--------------------------------\n";

    auto printLCA = [&](int p, int q)
    {
        Node *lca = LCA(bst2, p, q);
        cout << "LCA(" << p << ", " << q << ") = "
             << (lca ? to_string(lca->data) : "null") << "\n";
    };

    printLCA(1, 6);
    printLCA(4, 14);
    printLCA(6, 13);
    printLCA(1, 13);
    cout << "\n";

    deleteTree(bst2);

    // ── Part 4: Sorted Array to BST ──────────
    cout << "Part 4 — Sorted Array to Balanced BST:\n";
    cout << "--------------------------------\n";
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7};
    Node *balanced = sortedArrayToBST(arr, 0, arr.size() - 1);
    cout << "Inorder (should be sorted) : ";
    inorder(balanced);
    cout << "\n";
    cout << "Height (should be 2)       : " << height(balanced) << "\n";
    cout << "Tree is balanced           : " << (height(balanced) == 2 ? "Yes" : "No") << "\n";

    deleteTree(balanced);
    return 0;
}