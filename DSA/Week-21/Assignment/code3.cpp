#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
#include <climits>
#include <numeric>
#include <algorithm>
using namespace std;

// ── Part 1: Dijkstra ──────────────────────────
void dijkstra(vector<pair<int, int>> adj[],
              int src, int V)
{
    vector<int> dist(V + 1, INT_MAX);
    vector<int> prev(V + 1, -1);
    priority_queue<pair<int, int>,
                   vector<pair<int, int>>,
                   greater<>>
        pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty())
    {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u])
            continue;
        for (auto [v, w] : adj[u])
        {
            if (dist[u] + w < dist[v])
            {
                dist[v] = dist[u] + w;
                prev[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    cout << "Dijkstra from source " << src << ":\n";
    for (int i = 1; i <= V; i++)
    {
        cout << "  dist[" << i << "] = ";
        if (dist[i] == INT_MAX)
        {
            cout << "INF\n";
            continue;
        }
        cout << dist[i] << "  path: ";

        // Reconstruct path
        vector<int> path;
        for (int v = i; v != -1; v = prev[v])
            path.push_back(v);
        reverse(path.begin(), path.end());
        for (int j = 0; j < path.size(); j++)
        {
            cout << path[j];
            if (j < path.size() - 1)
                cout << "→";
        }
        cout << "\n";
    }
}

// ── Part 2: Kruskal MST ───────────────────────
struct DSU
{
    vector<int> p, r;
    DSU(int n) : p(n + 1), r(n + 1, 0)
    {
        iota(p.begin(), p.end(), 0);
    }
    int find(int x)
    {
        return p[x] == x ? x : p[x] = find(p[x]);
    }
    bool unite(int x, int y)
    {
        int px = find(x), py = find(y);
        if (px == py)
            return false;
        if (r[px] < r[py])
            swap(px, py);
        p[py] = px;
        if (r[px] == r[py])
            r[px]++;
        return true;
    }
};

void kruskal(vector<tuple<int, int, int>> &edges, int V)
{
    sort(edges.begin(), edges.end());
    DSU dsu(V);
    int totalW = 0, cnt = 0;

    cout << "Kruskal's MST:\n";
    for (auto [w, u, v] : edges)
    {
        if (dsu.unite(u, v))
        {
            cout << "  Add edge (" << u << " -- "
                 << v << ", w=" << w << ")\n";
            totalW += w;
            if (++cnt == V - 1)
                break;
        }
        else
        {
            cout << "  Skip edge (" << u << " -- "
                 << v << ", w=" << w << ") — creates cycle\n";
        }
    }
    cout << "  MST total weight = " << totalW << "\n";
}

// ── Part 3: Bellman-Ford ──────────────────────
void bellmanFord(vector<tuple<int, int, int>> &edges,
                 int src, int V, bool checkNegCycle)
{
    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    // Relax V-1 times
    for (int i = 0; i < V - 1; i++)
        for (auto [u, v, w] : edges)
            if (dist[u] != INT_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;

    // Check negative cycle
    bool negCycle = false;
    for (auto [u, v, w] : edges)
        if (dist[u] != INT_MAX && dist[u] + w < dist[v])
        {
            negCycle = true;
            break;
        }

    cout << "Bellman-Ford from source " << src << ":\n";
    for (int i = 0; i < V; i++)
    {
        cout << "  dist[" << i << "] = ";
        if (dist[i] == INT_MAX)
            cout << "INF";
        else
            cout << dist[i];
        cout << "\n";
    }
    if (checkNegCycle)
        cout << "  Negative cycle: "
             << (negCycle ? "DETECTED!" : "None") << "\n";
}

int main()
{
    // ── Part 1: Dijkstra ─────────────────────
    cout << "=== Part 1: Dijkstra's Algorithm ===\n";
    int V1 = 5;
    vector<pair<int, int>> dAdj[V1 + 1];
    auto addDE = [&](int u, int v, int w)
    {
        dAdj[u].push_back({v, w});
        dAdj[v].push_back({u, w});
    };
    addDE(1, 2, 4);
    addDE(1, 3, 2);
    addDE(2, 3, 1);
    addDE(2, 4, 5);
    addDE(3, 4, 8);
    addDE(3, 5, 10);
    addDE(4, 5, 2);
    addDE(2, 5, 6);

    dijkstra(dAdj, 1, V1);

    // ── Part 2: Kruskal ──────────────────────
    cout << "\n=== Part 2: Kruskal's MST ===\n";
    // {weight, u, v}
    vector<tuple<int, int, int>> kEdges = {
        {4, 1, 2}, {3, 1, 3}, {1, 2, 3}, {2, 2, 4}, {4, 3, 4}, {3, 3, 5}, {1, 4, 5}, {5, 4, 6}, {6, 5, 6}};
    kruskal(kEdges, 6);

    // ── Part 3: Bellman-Ford ─────────────────
    cout << "\n=== Part 3: Bellman-Ford ===\n";
    int V3 = 5;

    // Graph with negative edge, no negative cycle
    cout << "Graph 1 (negative edge, no neg cycle):\n";
    vector<tuple<int, int, int>> bEdges1 = {
        {0, 1, 4}, {0, 2, 3}, {1, 3, -2}, {1, 2, 1}, {2, 3, 1}, {3, 4, 1}, {2, 4, 5}};
    bellmanFord(bEdges1, 0, V3, false);

    // Graph with negative cycle
    cout << "\nGraph 2 (negative cycle: 1→3→1):\n";
    vector<tuple<int, int, int>> bEdges2 = bEdges1;
    bEdges2.push_back({3, 1, -5}); // Creates negative cycle
    bellmanFord(bEdges2, 0, V3, true);

    return 0;
}