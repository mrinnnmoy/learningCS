#include <iostream>
#include <vector>
#include <string>
#include <climits>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace std;
using namespace __gnu_pbds;

typedef tree<pair<int, int>, null_type,
             less<pair<int, int>>,
             rb_tree_tag,
             tree_order_statistics_node_update>
    ordered_set;

typedef tree<int, null_type, less<int>,
             rb_tree_tag,
             tree_order_statistics_node_update>
    oset;

// ── Part 1: RMQ Segment Tree ──────────────────
class RMQTree
{
private:
    int n;
    vector<int> tree;

    void build(vector<int> &arr, int nd, int s, int e)
    {
        if (s == e)
        {
            tree[nd] = arr[s];
            return;
        }
        int mid = (s + e) / 2;
        build(arr, 2 * nd, s, mid);
        build(arr, 2 * nd + 1, mid + 1, e);
        tree[nd] = min(tree[2 * nd], tree[2 * nd + 1]);
    }

    int query(int nd, int s, int e, int l, int r)
    {
        if (r < s || e < l)
            return INT_MAX;
        if (l <= s && e <= r)
            return tree[nd];
        int mid = (s + e) / 2;
        return min(query(2 * nd, s, mid, l, r),
                   query(2 * nd + 1, mid + 1, e, l, r));
    }

    void update(int nd, int s, int e, int idx, int val)
    {
        if (s == e)
        {
            tree[nd] = val;
            return;
        }
        int mid = (s + e) / 2;
        if (idx <= mid)
            update(2 * nd, s, mid, idx, val);
        else
            update(2 * nd + 1, mid + 1, e, idx, val);
        tree[nd] = min(tree[2 * nd], tree[2 * nd + 1]);
    }

public:
    RMQTree(vector<int> &arr)
    {
        n = arr.size();
        tree.assign(4 * n, INT_MAX);
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
};

// ── Part 2: Count Inversions ──────────────────
long long countInversions(vector<int> &arr)
{
    ordered_set os;
    long long inv = 0;
    int id = 0;

    for (int x : arr)
    {
        // Elements already inserted > x
        // = total inserted - elements <= x
        // = os.size() - os.order_of_key({x+1, 0})
        inv += os.size() - os.order_of_key({x, INT_MAX});
        os.insert({x, id++});
    }
    return inv;
}

// ── Part 3: Kth Smallest in Stream ────────────
struct Stream
{
    oset os;
    int uid = 0;

    void insert(int val)
    {
        os.insert(val);
        cout << "  INSERT " << val
             << "  → set size = " << os.size() << "\n";
    }

    void erase(int val)
    {
        auto it = os.find(val);
        if (it != os.end())
        {
            os.erase(it);
            cout << "  DELETE " << val
                 << "  → set size = " << os.size() << "\n";
        }
    }

    void kthSmallest(int k)
    {
        if (k > (int)os.size())
        {
            cout << "  QUERY  k=" << k
                 << " → Not enough elements\n";
            return;
        }
        cout << "  QUERY  k=" << k
             << " → " << *os.find_by_order(k - 1) << "\n";
    }
};

int main()
{
    // ── Part 1: RMQ ──────────────────────────
    cout << "=== Part 1: Range Minimum Query ===\n";
    vector<int> arr = {4, 3, 1, 6, 2, 9, 5};
    cout << "Array: 4 3 1 6 2 9 5\n\n";

    RMQTree rmq(arr);
    cout << "query(0,6) = " << rmq.query(0, 6) << "\n";
    cout << "query(1,5) = " << rmq.query(1, 5) << "\n";
    cout << "query(0,2) = " << rmq.query(0, 2) << "\n";

    rmq.update(2, 8);
    cout << "\nAfter update(idx=2, val=8):\n";
    cout << "query(0,2) = " << rmq.query(0, 2) << "\n";
    cout << "query(0,6) = " << rmq.query(0, 6) << "\n";

    // ── Part 2: Inversions ───────────────────
    cout << "\n=== Part 2: Count Inversions ===\n";
    vector<int> a1 = {2, 4, 1, 3, 5};
    vector<int> a2 = {5, 4, 3, 2, 1};
    vector<int> a3 = {1, 2, 3, 4, 5};

    cout << "[2,4,1,3,5]: " << countInversions(a1)
         << " inversions\n";
    cout << "[5,4,3,2,1]: " << countInversions(a2)
         << " inversions\n";
    cout << "[1,2,3,4,5]: " << countInversions(a3)
         << " inversions\n";

    // ── Part 3: Stream ───────────────────────
    cout << "\n=== Part 3: Kth Smallest in Stream ===\n";
    Stream stream;
    stream.insert(5);
    stream.insert(3);
    stream.insert(8);
    stream.kthSmallest(2);
    stream.insert(1);
    stream.insert(7);
    stream.kthSmallest(1);
    stream.kthSmallest(3);
    stream.erase(3);
    stream.kthSmallest(2);

    return 0;
}