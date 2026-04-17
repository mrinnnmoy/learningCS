#include <iostream>
#include <vector>
#include <climits>
using namespace std;

class SegTree
{
private:
    int n;
    vector<int> tree;

    void build(vector<int> &arr, int node,
               int start, int end)
    {
        if (start == end)
        {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    int query(int node, int start, int end,
              int l, int r)
    {
        if (r < start || end < l)
            return 0;
        if (l <= start && end <= r)
            return tree[node];
        int mid = (start + end) / 2;
        return query(2 * node, start, mid, l, r) +
               query(2 * node + 1, mid + 1, end, l, r);
    }

    void update(int node, int start, int end,
                int idx, int val)
    {
        if (start == end)
        {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        if (idx <= mid)
            update(2 * node, start, mid, idx, val);
        else
            update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

public:
    SegTree(vector<int> &arr)
    {
        n = arr.size();
        tree.assign(4 * n, 0);
        build(arr, 1, 0, n - 1);
    }

    int query(int l, int r)
    {
        return query(1, 0, n - 1, l, r);
    }

    void update(int idx, int val)
    {
        update(1, 0, n - 1, idx, val);
    }

    void printTree()
    {
        cout << "Segment Tree Array (1-indexed):\n";
        for (int i = 1; i < 4 * n; i++)
        {
            if (tree[i] != 0)
                cout << "  tree[" << i << "] = " << tree[i] << "\n";
        }
    }
};

int main()
{
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegTree st(arr);

    cout << "Array: 1 3 5 7 9 11\n\n";
    st.printTree();

    cout << "\n=== Queries Before Update ===\n";
    cout << "query(0,5) = " << st.query(0, 5) << "\n";
    cout << "query(1,4) = " << st.query(1, 4) << "\n";
    cout << "query(2,3) = " << st.query(2, 3) << "\n";
    cout << "query(0,0) = " << st.query(0, 0) << "\n";

    cout << "\n=== Point Update: arr[3] = 10 ===\n";
    st.update(3, 10);

    cout << "\n=== Queries After Update ===\n";
    cout << "query(0,5) = " << st.query(0, 5) << "\n";
    cout << "query(1,4) = " << st.query(1, 4) << "\n";
    cout << "query(3,5) = " << st.query(3, 5) << "\n";

    return 0;
}