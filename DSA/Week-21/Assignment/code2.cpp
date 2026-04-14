#include <iostream>
#include <vector>
#include <stack>
#include <queue>
#include <numeric>
using namespace std;

// ── Part 1a: Undirected Cycle Detection ───────
bool cycleUndirectedDFS(vector<int> adj[], int node,
                        int parent,
                        vector<bool> &visited)
{
    visited[node] = true;
    for (int nb : adj[node])
    {
        if (!visited[nb])
        {
            if (cycleUndirectedDFS(adj, nb, node, visited))
                return true;
        }
        else if (nb != parent)
            return true;
    }
    return false;
}

bool hasCycleUndirected(vector<int> adj[], int V)
{
    vector<bool> vis(V + 1, false);
    for (int i = 1; i <= V; i++)
        if (!vis[i])
            if (cycleUndirectedDFS(adj, i, -1, vis))
                return true;
    return false;
}

// ── Part 1b: Directed Cycle Detection ─────────
bool cycleDirectedDFS(vector<int> adj[], int node,
                      vector<bool> &vis,
                      vector<bool> &recStack)
{
    vis[node] = recStack[node] = true;
    for (int nb : adj[node])
    {
        if (!vis[nb])
        {
            if (cycleDirectedDFS(adj, nb, vis, recStack))
                return true;
        }
        else if (recStack[nb])
            return true;
    }
    recStack[node] = false;
    return false;
}

bool hasCycleDirected(vector<int> adj[], int V)
{
    vector<bool> vis(V + 1, false), rec(V + 1, false);
    for (int i = 1; i <= V; i++)
        if (!vis[i])
            if (cycleDirectedDFS(adj, i, vis, rec))
                return true;
    return false;
}

// ── Part 2: Topological Sort ──────────────────
// DFS-based
void topoDFS(vector<int> adj[], int node,
             vector<bool> &vis, stack<int> &st)
{
    vis[node] = true;
    for (int nb : adj[node])
        if (!vis[nb])
            topoDFS(adj, nb, vis, st);
    st.push(node);
}

vector<int> topoSortDFS(vector<int> adj[], int V)
{
    vector<bool> vis(V + 1, false);
    stack<int> st;
    for (int i = 0; i <= V; i++)
        if (!vis[i] && !adj[i].empty())
            topoDFS(adj, i, vis, st);
    // Also check 0-indexed vertices
    vector<int> order;
    while (!st.empty())
    {
        order.push_back(st.top());
        st.pop();
    }
    return order;
}

// Kahn's BFS-based
vector<int> kahnTopoSort(vector<int> adj[], int V)
{
    vector<int> inDeg(V, 0);
    for (int u = 0; u < V; u++)
        for (int v : adj[u])
            inDeg[v]++;

    queue<int> q;
    for (int i = 0; i < V; i++)
        if (inDeg[i] == 0)
            q.push(i);

    vector<int> order;
    while (!q.empty())
    {
        int node = q.front();
        q.pop();
        order.push_back(node);
        for (int nb : adj[node])
            if (--inDeg[nb] == 0)
                q.push(nb);
    }
    return order;
}

// ── Part 3: DSU ───────────────────────────────
struct DSU
{
    vector<int> parent, rank_;
    int components;

    DSU(int n) : parent(n + 1), rank_(n + 1, 0), components(n)
    {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x)
    {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    void unite(int x, int y)
    {
        int px = find(x), py = find(y);
        if (px == py)
            return;
        if (rank_[px] < rank_[py])
            swap(px, py);
        parent[py] = px;
        if (rank_[px] == rank_[py])
            rank_[px]++;
        components--;
    }
};

int main()
{
    // ── Part 1a: Undirected ───────────────────
    cout << "=== Part 1: Cycle Detection ===\n";
    cout << "--- Undirected ---\n";

    vector<int> ug1[5], ug2[5];
    // With cycle: (1,2),(2,3),(3,4),(4,2)
    auto addU = [](vector<int> adj[], int u, int v)
    {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };
    addU(ug1, 1, 2);
    addU(ug1, 2, 3);
    addU(ug1, 3, 4);
    addU(ug1, 4, 2);
    addU(ug2, 1, 2);
    addU(ug2, 2, 3);
    addU(ug2, 3, 4);

    cout << "Graph1 (1-2-3-4-2) has cycle: "
         << (hasCycleUndirected(ug1, 4) ? "Yes" : "No") << "\n";
    cout << "Graph2 (1-2-3-4)   has cycle: "
         << (hasCycleUndirected(ug2, 4) ? "Yes" : "No") << "\n";

    cout << "\n--- Directed ---\n";
    vector<int> dg1[4], dg2[4];
    // With cycle: 1→2→3→1
    dg1[1].push_back(2);
    dg1[2].push_back(3);
    dg1[3].push_back(1);
    // No cycle: 1→2→3, 1→3
    dg2[1].push_back(2);
    dg2[2].push_back(3);
    dg2[1].push_back(3);

    cout << "Graph1 (1→2→3→1) has cycle: "
         << (hasCycleDirected(dg1, 3) ? "Yes" : "No") << "\n";
    cout << "Graph2 (1→2,2→3,1→3) has cycle: "
         << (hasCycleDirected(dg2, 3) ? "Yes" : "No") << "\n";

    // ── Part 2: Topo Sort ─────────────────────
    cout << "\n=== Part 2: Topological Sort ===\n";
    cout << "Courses: 5→0, 5→2, 4→0, 4→1, 2→3, 3→1\n";
    int numCourses = 6;
    vector<int> dag[numCourses];
    dag[5].push_back(0);
    dag[5].push_back(2);
    dag[4].push_back(0);
    dag[4].push_back(1);
    dag[2].push_back(3);
    dag[3].push_back(1);

    auto dfsOrder = topoSortDFS(dag, numCourses);
    cout << "DFS Topo order  : ";
    for (int x : dfsOrder)
        cout << x << " ";
    cout << "\n";

    vector<int> dag2[numCourses];
    dag2[5].push_back(0);
    dag2[5].push_back(2);
    dag2[4].push_back(0);
    dag2[4].push_back(1);
    dag2[2].push_back(3);
    dag2[3].push_back(1);

    auto kahnOrder = kahnTopoSort(dag2, numCourses);
    cout << "Kahn Topo order : ";
    for (int x : kahnOrder)
        cout << x << " ";
    cout << "\n";

    // ── Part 3: DSU ───────────────────────────
    cout << "\n=== Part 3: DSU Connected Components ===\n";
    DSU dsu(5);
    cout << "Initial components: " << dsu.components << "\n";

    vector<pair<int, int>> ops = {{1, 2}, {3, 4}, {2, 3}, {4, 5}};
    for (auto [u, v] : ops)
    {
        dsu.unite(u, v);
        cout << "After union(" << u << "," << v << "): "
             << dsu.components << " components\n";
    }

    return 0;
}