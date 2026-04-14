#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int MAXV = 9;
vector<int> adj[MAXV];
int adjMatrix[MAXV][MAXV];

void addEdge(int u, int v)
{
    adj[u].push_back(v);
    adj[v].push_back(u);
    adjMatrix[u][v] = 1;
    adjMatrix[v][u] = 1;
}

// ── Part 1: Print Representations ────────────
void printAdjList(int V)
{
    cout << "Adjacency List:\n";
    for (int i = 1; i <= V; i++)
    {
        cout << i << ": ";
        for (int nb : adj[i])
            cout << nb << " ";
        cout << "\n";
    }
}

void printAdjMatrix(int V)
{
    cout << "\nAdjacency Matrix:\n  ";
    for (int i = 1; i <= V; i++)
        cout << i << " ";
    cout << "\n";
    for (int i = 1; i <= V; i++)
    {
        cout << i << " ";
        for (int j = 1; j <= V; j++)
            cout << adjMatrix[i][j] << " ";
        cout << "\n";
    }
}

// ── Part 2: BFS ───────────────────────────────
void BFS(int start, int V)
{
    vector<int> dist(V + 1, -1);
    queue<int> q;
    dist[start] = 0;
    q.push(start);

    cout << "\nBFS from " << start << ": ";
    while (!q.empty())
    {
        int node = q.front();
        q.pop();
        cout << node << " ";
        for (int nb : adj[node])
            if (dist[nb] == -1)
            {
                dist[nb] = dist[node] + 1;
                q.push(nb);
            }
    }

    cout << "\nBFS distances from " << start << ":\n";
    for (int i = 1; i <= V; i++)
        cout << "  dist[" << i << "] = "
             << dist[i] << "\n";
}

// ── Part 3: DFS ───────────────────────────────
void DFS(int node, vector<bool> &visited)
{
    visited[node] = true;
    cout << node << " ";
    for (int nb : adj[node])
        if (!visited[nb])
            DFS(nb, visited);
}

void DFSFull(int start, int V)
{
    vector<bool> visited(V + 1, false);
    int components = 0;

    cout << "\nDFS from " << start << ": ";
    DFS(start, visited);
    components++;

    // Check remaining unvisited (disconnected components)
    for (int i = 1; i <= V; i++)
    {
        if (!visited[i])
        {
            cout << "\n[New component] DFS from " << i << ": ";
            DFS(i, visited);
            components++;
        }
    }
    cout << "\nConnected components: " << components << "\n";
}

int main()
{
    int V = 8;
    vector<pair<int, int>> edges = {
        {1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 5}, {4, 6}, {7, 8}};
    for (auto [u, v] : edges)
        addEdge(u, v);

    printAdjList(V);
    printAdjMatrix(V);
    BFS(1, V);
    DFSFull(1, V);

    return 0;
}