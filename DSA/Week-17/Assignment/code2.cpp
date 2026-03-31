#include <iostream>
#include <climits>
using namespace std;

struct Node
{
    int data;
    Node *left;
    Node *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

// ── Insert ────────────────────────────────────
Node *insert(Node *root, int val)
{
    if (!root)
        return new Node(val);
    if (val < root->data)
        root->left = insert(root->left, val);
    else if (val > root->data)
        root->right = insert(root->right, val);
    return root;
}

// ── Search ────────────────────────────────────
bool search(Node *root, int val)
{
    if (!root)
        return false;
    if (root->data == val)
        return true;
    if (val < root->data)
        return search(root->left, val);
    else
        return search(root->right, val);
}

// ── Min / Max ─────────────────────────────────
Node *findMin(Node *root)
{
    while (root->left)
        root = root->left;
    return root;
}

Node *findMax(Node *root)
{
    while (root->right)
        root = root->right;
    return root;
}

// ── Delete ────────────────────────────────────
Node *deleteNode(Node *root, int val)
{
    if (!root)
        return nullptr;

    if (val < root->data)
        root->left = deleteNode(root->left, val);
    else if (val > root->data)
        root->right = deleteNode(root->right, val);
    else
    {
        // Case 1 & 2: 0 or 1 child
        if (!root->left)
        {
            Node *t = root->right;
            delete root;
            return t;
        }
        if (!root->right)
        {
            Node *t = root->left;
            delete root;
            return t;
        }

        // Case 3: 2 children — replace with inorder successor
        Node *successor = findMin(root->right);
        root->data = successor->data;
        root->right = deleteNode(root->right, successor->data);
    }
    return root;
}

// ── Valid BST ─────────────────────────────────
bool isValidBST(Node *root, long long minVal, long long maxVal)
{
    if (!root)
        return true;
    if (root->data <= minVal || root->data >= maxVal)
        return false;
    return isValidBST(root->left, minVal, root->data) && isValidBST(root->right, root->data, maxVal);
}

// ── Kth Smallest ──────────────────────────────
void kthSmallest(Node *root, int &k, int &result)
{
    if (!root || k == 0)
        return;
    kthSmallest(root->left, k, result);
    k--;
    if (k == 0)
    {
        result = root->data;
        return;
    }
    kthSmallest(root->right, k, result);
}

// ── Inorder print ─────────────────────────────
void inorder(Node *root)
{
    if (!root)
        return;
    inorder(root->left);
    cout << root->data << " ";
    inorder(root->right);
}

// ── Free memory ──────────────────────────────
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
    Node *root = nullptr;

    // ── Insert ───────────────────────────────
    int vals[] = {8, 3, 10, 1, 6, 14, 4, 7, 13};
    for (int v : vals)
        root = insert(root, v);
    cout << "After inserts (inorder): ";
    inorder(root);
    cout << "\n";

    // ── Search ───────────────────────────────
    cout << "Search 6  : " << (search(root, 6) ? "Found" : "Not Found") << "\n";
    cout << "Search 15 : " << (search(root, 15) ? "Found" : "Not Found") << "\n";

    // ── Min / Max ────────────────────────────
    cout << "Min       : " << findMin(root)->data << "\n";
    cout << "Max       : " << findMax(root)->data << "\n";

    // ── Kth Smallest ─────────────────────────
    int k = 3, result = -1;
    kthSmallest(root, k, result);
    cout << "3rd Smallest : " << result << "\n";

    // ── Delete ───────────────────────────────
    root = deleteNode(root, 1);
    cout << "After deleting 1  (leaf)       : ";
    inorder(root);
    cout << "\n";

    root = deleteNode(root, 3);
    cout << "After deleting 3  (two child)  : ";
    inorder(root);
    cout << "\n";

    root = deleteNode(root, 10);
    cout << "After deleting 10 (one child)  : ";
    inorder(root);
    cout << "\n";

    // ── Valid BST ────────────────────────────
    cout << "Is Valid BST : "
         << (isValidBST(root, LLONG_MIN, LLONG_MAX) ? "true" : "false") << "\n";

    deleteTree(root);
    return 0;
}