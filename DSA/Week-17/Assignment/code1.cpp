#include <iostream>
#include <queue>
using namespace std;

struct Node
{
    int data;
    Node *left;
    Node *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

// ── Traversals ────────────────────────────────
void inorder(Node *root)
{
    if (!root)
        return;
    inorder(root->left);
    cout << root->data << " ";
    inorder(root->right);
}

void preorder(Node *root)
{
    if (!root)
        return;
    cout << root->data << " ";
    preorder(root->left);
    preorder(root->right);
}

void postorder(Node *root)
{
    if (!root)
        return;
    postorder(root->left);
    postorder(root->right);
    cout << root->data << " ";
}

void levelOrder(Node *root)
{
    if (!root)
        return;
    queue<Node *> q;
    q.push(root);
    while (!q.empty())
    {
        Node *curr = q.front();
        q.pop();
        cout << curr->data << " ";
        if (curr->left)
            q.push(curr->left);
        if (curr->right)
            q.push(curr->right);
    }
}

// ── Properties ───────────────────────────────
int height(Node *root)
{
    if (!root)
        return -1;
    return 1 + max(height(root->left), height(root->right));
}

int countNodes(Node *root)
{
    if (!root)
        return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}

int countLeaves(Node *root)
{
    if (!root)
        return 0;
    if (!root->left && !root->right)
        return 1;
    return countLeaves(root->left) + countLeaves(root->right);
}

// ── Mirror ────────────────────────────────────
void mirror(Node *root)
{
    if (!root)
        return;
    swap(root->left, root->right);
    mirror(root->left);
    mirror(root->right);
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
    // Build the tree manually
    Node *root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->left = new Node(6);
    root->right->right = new Node(7);

    cout << "Inorder     : ";
    inorder(root);
    cout << "\n";
    cout << "Preorder    : ";
    preorder(root);
    cout << "\n";
    cout << "Postorder   : ";
    postorder(root);
    cout << "\n";
    cout << "Level Order : ";
    levelOrder(root);
    cout << "\n";
    cout << "Height      : " << height(root) << "\n";
    cout << "Total Nodes : " << countNodes(root) << "\n";
    cout << "Leaf Nodes  : " << countLeaves(root) << "\n";

    mirror(root);
    cout << "Inorder after mirror: ";
    inorder(root);
    cout << "\n";

    deleteTree(root);
    return 0;
}