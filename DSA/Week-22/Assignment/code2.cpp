#include <iostream>
#include <vector>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace std;
using namespace __gnu_pbds;

typedef tree<int, null_type, less<int>,
             rb_tree_tag,
             tree_order_statistics_node_update>
    ordered_set;

// ── Part 1: Lazy Segment Tree ─────────────────
class LazySegTree
{
private:
    int n;
    vector<long long> tree, lazy;

    void build(vector<int> &arr, int node,
               int s, int e)
    {
        lazy[node] = 0;
        if (s == e)
        {
            tree[node] = arr[s];
            return;
        }
        int mid = (s + e) / 2;
        build(arr, 2 * node, s, mid);
        build(arr, 2 * node + 1, mid + 1, e);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void pushDown(int node, int s, int e)
    {
        if (lazy[node])
        {
            int mid = (s + e) / 2;
            tree[2 * node] += lazy[node] * (mid - s + 1);
            lazy[2 * node] += lazy[node];
            tree[2 * node + 1] += lazy[node] * (e - mid);
            lazy[2 * node + 1] += lazy[node];
            lazy[node] = 0;
        }
    }

    void update(int node, int s, int e,
                int l, int r, long long val)
    {
        if (r < s || e < l)
            return;
        if (l <= s && e <= r)
        {
            tree[node] += val * (e - s + 1);
            lazy[node] += val;
            return;
        }
        pushDown(node, s, e);
        int mid = (s + e) / 2;
        update(2 * node, s, mid, l, r, val);
        update(2 * node + 1, mid + 1, e, l, r, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    long long query(int node, int s, int e,
                    int l, int r)
    {
        if (r < s || e < l)
            return 0;
        if (l <= s && e <= r)
            return tree[node];
        pushDown(node, s, e);
        int mid = (s + e) / 2;
        return query(2 * node, s, mid, l, r) +
               query(2 * node + 1, mid + 1, e, l, r);
    }

public:
    LazySegTree(vector<int> &arr)
    {
        n = arr.size();
        tree.assign(4 * n, 0);
        lazy.assign(4 * n, 0);
        build(arr, 1, 0, n - 1);
    }

    void update(int l, int r, int val)
    {
        update(1, 0, n - 1, l, r, val);
    }

    long long query(int l, int r)
    {
        return query(1, 0, n - 1, l, r);
    }
};

int main()
{
    // ── Part 1: Lazy Seg Tree ─────────────────
    cout << "=== Part 1: Lazy Segment Tree ===\n";
    vector<int> arr = {1, 2, 3, 4, 5};
    cout << "Array: 1 2 3 4 5\n\n";

    LazySegTree lst(arr);

    cout << "query(0,4)        = " << lst.query(0, 4) << "\n";

    lst.update(1, 3, 3);
    cout << "After update(1,3,+3):\n";
    cout << "query(0,4)        = " << lst.query(0, 4) << "\n";
    cout << "query(1,3)        = " << lst.query(1, 3) << "\n";

    lst.update(0, 2, 2);
    cout << "After update(0,2,+2):\n";
    cout << "query(0,4)        = " << lst.query(0, 4) << "\n";
    cout << "query(0,2)        = " << lst.query(0, 2) << "\n";

    // ── Part 2: Ordered Set ───────────────────
    cout << "\n=== Part 2: Ordered Set ===\n";
    ordered_set os;
    vector<int> inserts = {15, 5, 25, 10, 20, 30, 1};

    cout << "Inserting: ";
    for (int x : inserts)
    {
        os.insert(x);
        cout << x << " ";
    }
    cout << "\nSorted set: ";
    for (int x : os)
        cout << x << " ";
    cout << "\n\n";

    cout << "find_by_order(0) = "
         << *os.find_by_order(0) << "\n";
    cout << "find_by_order(3) = "
         << *os.find_by_order(3) << "\n";
    cout << "order_of_key(15) = "
         << os.order_of_key(15) << " (elements < 15)\n";
    cout << "order_of_key(100)= "
         << os.order_of_key(100) << " (elements < 100)\n";

    os.erase(10);
    cout << "\nAfter erase(10):\n";
    cout << "Sorted set: ";
    for (int x : os)
        cout << x << " ";
    cout << "\n";
    cout << "find_by_order(2) = "
         << *os.find_by_order(2) << "\n";

    return 0;
}