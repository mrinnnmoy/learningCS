# List of things learned.

## 1. Introduction to Graphs

A **Graph** is a non-linear data structure consisting of a set of **vertices** (nodes) connected by **edges**.

Unlike trees which have a strict parent-child hierarchy, graphs can have connections in any direction. A node can connect to any other node, including itself.

> 📷 **Graph — vertices connected by edges:**
> ![Graph](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/6n-graf.svg/330px-6n-graf.svg.png)

```
Graph G = (V, E)
V = {1, 2, 3, 4, 5, 6}   ← vertices
E = {(1,2),(1,5),(2,3),(2,5),(3,4),(4,5),(4,6)} ← edges
```

### Real-Life Applications

| Domain            | Graph Use                                  |
| ----------------- | ------------------------------------------ |
| Social Networks   | Users = vertices, friendships = edges      |
| Maps / Navigation | Cities = vertices, roads = edges           |
| Internet          | Web pages = vertices, hyperlinks = edges   |
| Compilers         | Variables = vertices, dependencies = edges |
| Circuits          | Components = vertices, wires = edges       |
| Recommendation    | Items = vertices, similarity = edges       |

---

## 2. Graph Terminology

Understanding these terms is essential before writing any graph algorithm:

| Term              | Definition                                        |
| ----------------- | ------------------------------------------------- |
| **Vertex / Node** | A fundamental unit of a graph                     |
| **Edge**          | A connection between two vertices                 |
| **Adjacent**      | Two vertices connected by an edge                 |
| **Degree**        | Number of edges connected to a vertex             |
| **In-degree**     | Edges coming INTO a vertex (directed graphs)      |
| **Out-degree**    | Edges going OUT of a vertex (directed graphs)     |
| **Path**          | Sequence of vertices connected by edges           |
| **Cycle**         | A path that starts and ends at the same vertex    |
| **Connected**     | Every vertex is reachable from every other vertex |
| **Component**     | A maximal connected subgraph                      |
| **Weight**        | A value associated with an edge                   |

```
Undirected graph:
    1 --- 2
    |   / |
    |  /  |
    3 --- 4

Degree of vertex 2 = 3 (connected to 1, 3, 4)
Path from 1 to 4: 1→2→4 or 1→3→4 or 1→3→2→4
Cycle: 1→2→3→1
```

---

## 3. Types of Graphs

### 3.1 Undirected Graph

Edges have **no direction**, connection is bidirectional.

If vertex A connects to B, then B also connects to A.

```
A --- B --- C
      |
      D
```

### 3.2 Directed Graph (Digraph)

Edges have a **direction**, indicated by arrows.

A→B means you can go from A to B but not necessarily B to A.

> 📷 **Directed Graph:**
> ![Directed Graph](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Directed.svg/250px-Directed.svg.png)

```
A → B → C
↑       |
└───────┘
```

### 3.3 Weighted Graph

Each edge has a **weight** (cost, distance, time, etc.).

> 📷 **Weighted Graph:**
> ![Weighted Graph](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/CPT-Graphs-directed-weighted-ex1.svg/250px-CPT-Graphs-directed-weighted-ex1.svg.png)

```
    4       2
A ───── B ───── C
 \           /
  5 \     / 1
      \ /
       D
```

### 3.4 Cyclic vs Acyclic Graph

- **Cyclic** : contains at least one cycle
- **Acyclic** : contains no cycles
- **DAG** (Directed Acyclic Graph) : directed + no cycles → used in topological sort, dependency resolution

### 3.5 Connected vs Disconnected Graph

- **Connected** : there is a path between every pair of vertices
- **Disconnected** : some vertices are unreachable from others

### 3.6 Complete Graph

Every vertex is connected to every other vertex.
A complete graph with n vertices has n(n-1)/2 edges.

---

## 4. Graph Representations

How we store a graph in memory fundamentally affects algorithm performance.

### 4.1 Adjacency Matrix

A 2D array where `matrix[i][j] = 1` (or weight) if there's an edge from i to j, else 0.

> 📷 **Adjacency Matrix:**
> ![Adjacency Matrix](https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/6n-graph2.svg/250px-6n-graph2.svg.png)

```
Graph:          Adjacency Matrix:
1 --- 2            1  2  3  4
|     |         1[ 0  1  1  0 ]
3 --- 4         2[ 1  0  0  1 ]
                3[ 1  0  0  1 ]
                4[ 0  1  1  0 ]
```

```cpp
// Adjacency Matrix representation
const int MAXV = 100;
int adjMatrix[MAXV][MAXV];

void addEdge(int u, int v) {
    adjMatrix[u][v] = 1;
    adjMatrix[v][u] = 1;   // Remove for directed graph
}

// For weighted graph
void addWeightedEdge(int u, int v, int w) {
    adjMatrix[u][v] = w;
    adjMatrix[v][u] = w;
}
```

**Pros:** O(1) edge lookup, simple to implement

**Cons:** O(V²) space, wasteful for sparse graphs

---

### 4.2 Adjacency List

Each vertex stores a list of its neighbors.
Most commonly used in competitive programming.

```
Graph:          Adjacency List:
1 --- 2         1: [2, 3]
|     |         2: [1, 4]
3 --- 4         3: [1, 4]
                4: [2, 3]
```

```cpp
#include <vector>
using namespace std;

// Adjacency List — unweighted
vector<int> adjList[MAXV];

void addEdge(int u, int v) {
    adjList[u].push_back(v);
    adjList[v].push_back(u);   // Remove for directed graph
}

// Adjacency List — weighted
vector<pair<int,int>> adjListW[MAXV];   // {neighbor, weight}

void addWeightedEdge(int u, int v, int w) {
    adjListW[u].push_back({v, w});
    adjListW[v].push_back({u, w});
}
```

**Pros:** Space-efficient O(V+E), fast neighbor iteration

**Cons:** O(degree) edge lookup

---

### 4.3 Edge List

Simply store all edges as pairs (or triples for weighted).

Used mainly in algorithms like Kruskal's MST.

```cpp
vector<pair<int,int>> edges;          // Unweighted: {u, v}
vector<tuple<int,int,int>> wedges;    // Weighted:   {weight, u, v}

void addEdge(int u, int v) {
    edges.push_back({u, v});
}

void addWeightedEdge(int u, int v, int w) {
    wedges.push_back({w, u, v});
}
```

---

### Comparison Table

|                | Adjacency Matrix | Adjacency List | Edge List        |
| -------------- | ---------------- | -------------- | ---------------- |
| Space          | O(V²)            | O(V+E)         | O(E)             |
| Add edge       | O(1)             | O(1)           | O(1)             |
| Check edge     | O(1)             | O(degree)      | O(E)             |
| Find neighbors | O(V)             | O(degree)      | O(E)             |
| Best for       | Dense graphs     | Sparse graphs  | Edge-based algos |

---

## 5. Graph Traversals

### 5.1 Breadth First Search (BFS)

BFS explores all neighbors of a vertex before moving to the next level. It uses a **queue**.

> 📷 **BFS Traversal order:**
> ![BFS](https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Animated_BFS.gif/250px-Animated_BFS.gif)

```
Graph:
    1
   / \
  2   3
 / \   \
4   5   6

BFS from 1:
Queue: [1]
Visit 1 → enqueue neighbors 2,3 → Queue: [2,3]
Visit 2 → enqueue neighbors 4,5 → Queue: [3,4,5]
Visit 3 → enqueue neighbor  6   → Queue: [4,5,6]
Visit 4 → no new neighbors      → Queue: [5,6]
Visit 5 → no new neighbors      → Queue: [6]
Visit 6 → no new neighbors      → Queue: []

BFS order: 1 2 3 4 5 6
```

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void BFS(vector<int> adj[], int start, int V) {
    vector<bool> visited(V + 1, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    cout << "BFS: ";
    while (!q.empty()) {
        int node = q.front(); q.pop();
        cout << node << " ";

        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
    cout << "\n";
}
```

**Time Complexity:** O(V + E)

**Space Complexity:** O(V)

**BFS Applications:**

- Shortest path in unweighted graphs
- Level order traversal
- Finding connected components
- Detecting cycles in undirected graphs

---

### 5.2 Depth First Search (DFS)

DFS explores as far as possible along each branch before backtracking. It uses a **stack** (or recursion).

> 📷 **DFS Traversal order:**
> ![DFS](https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Depth-First-Search.gif/250px-Depth-First-Search.gif)

```
Same graph as above:
    1
   / \
  2   3
 / \   \
4   5   6

DFS from 1 (recursive):
Visit 1 → go to 2
Visit 2 → go to 4
Visit 4 → no unvisited neighbors → backtrack to 2
Visit 5 → no unvisited neighbors → backtrack to 2 → backtrack to 1
Visit 3 → go to 6
Visit 6 → done

DFS order: 1 2 4 5 3 6
```

```cpp
void DFS(vector<int> adj[], int node,
         vector<bool>& visited) {
    visited[node] = true;
    cout << node << " ";

    for (int neighbor : adj[node])
        if (!visited[neighbor])
            DFS(adj, neighbor, visited);
}

void DFSTraversal(vector<int> adj[], int start, int V) {
    vector<bool> visited(V + 1, false);
    cout << "DFS: ";
    DFS(adj, start, visited);
    cout << "\n";
}
```

**Time Complexity:** O(V + E)

**Space Complexity:** O(V) (recursion stack)

**DFS Applications:**

- Cycle detection
- Topological sort
- Finding strongly connected components
- Solving mazes and puzzles
- Path finding

---

## 6. Connected Components

A **connected component** is a maximal subgraph in which every vertex is reachable from every other vertex.

```
Disconnected graph:
1 --- 2     4 --- 5
|           |
3           6

Components: {1,2,3} and {4,5,6}
```

```cpp
int countComponents(vector<int> adj[], int V) {
    vector<bool> visited(V + 1, false);
    int components = 0;

    for (int i = 1; i <= V; i++) {
        if (!visited[i]) {
            components++;
            DFS(adj, i, visited);   // Mark all reachable nodes
        }
    }
    return components;
}
```

---

## 7. Cycle Detection

### 7.1 Cycle Detection in Undirected Graph (BFS/DFS)

A cycle exists if we visit a neighbor that is already visited and is NOT the parent of the current node.

```
Graph with cycle:
1 --- 2
|     |
3 --- 4

DFS from 1:
Visit 1 (parent=-1) → go to 2 (parent=1) → go to 4 (parent=2)
→ go to 3 (parent=4) → neighbor 1 is visited and NOT parent of 3 → CYCLE!
```

```cpp
bool hasCycleDFS(vector<int> adj[], int node,
                 int parent, vector<bool>& visited) {
    visited[node] = true;

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            if (hasCycleDFS(adj, neighbor, node, visited))
                return true;
        } else if (neighbor != parent) {
            return true;   // Back edge found → cycle!
        }
    }
    return false;
}

bool hasCycleUndirected(vector<int> adj[], int V) {
    vector<bool> visited(V + 1, false);
    for (int i = 1; i <= V; i++)
        if (!visited[i])
            if (hasCycleDFS(adj, i, -1, visited))
                return true;
    return false;
}
```

---

### 7.2 Cycle Detection in Directed Graph

For directed graphs, we use a **recursion stack** to track the current DFS path. A back edge to a node in the current path = cycle.

```cpp
bool hasCycleDirectedDFS(vector<int> adj[], int node,
                          vector<bool>& visited,
                          vector<bool>& recStack) {
    visited[node]  = true;
    recStack[node] = true;   // Add to current path

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            if (hasCycleDirectedDFS(adj, neighbor,
                                    visited, recStack))
                return true;
        } else if (recStack[neighbor]) {
            return true;   // Back edge in current path → cycle!
        }
    }

    recStack[node] = false;   // Remove from current path
    return false;
}

bool hasCycleDirected(vector<int> adj[], int V) {
    vector<bool> visited(V+1, false);
    vector<bool> recStack(V+1, false);

    for (int i = 1; i <= V; i++)
        if (!visited[i])
            if (hasCycleDirectedDFS(adj, i, visited, recStack))
                return true;
    return false;
}
```

---

## 8. Shortest Path Algorithms

### 8.1 BFS Shortest Path (Unweighted Graph)

For unweighted graphs, BFS naturally finds the shortest path because it explores level by level.

```
Graph:         BFS from 1:
1---2---3      Level 0: {1}     dist[1]=0
|       |      Level 1: {2,4}   dist[2]=1, dist[4]=1
4---5---6      Level 2: {3,5}   dist[3]=2, dist[5]=2
               Level 3: {6}     dist[6]=3
```

```cpp
vector<int> BFSShortestPath(vector<int> adj[],
                             int start, int V) {
    vector<int>  dist(V+1, -1);
    queue<int>   q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int node = q.front(); q.pop();
        for (int neighbor : adj[node]) {
            if (dist[neighbor] == -1) {
                dist[neighbor] = dist[node] + 1;
                q.push(neighbor);
            }
        }
    }
    return dist;
}
```

---

### 8.2 Dijkstra's Algorithm (Weighted Graph, No Negative Weights)

Dijkstra finds shortest paths from a source to all vertices in a weighted graph.

**Idea:** Always process the unvisited vertex with the smallest known distance.

Uses a **min-heap (priority queue)**.

> 📷 **Dijkstra's Algorithm:**
> ![Dijkstra](https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Dijkstra_Animation.gif/250px-Dijkstra_Animation.gif)

```
Graph (weighted):
    4       2
1 ───── 2 ───── 3
 \           /
  8 \     / 1
      \ /
       4

From source 1:
dist = [INF, 0, INF, INF, INF]  (1-indexed)

Process 1 (dist=0):  update dist[2]=4, dist[4]=8
Process 2 (dist=4):  update dist[3]=6, dist[4]=11
Process 3 (dist=6):  update dist[4]=7
Process 4 (dist=7):  no updates needed

Final: dist = [-, 0, 4, 6, 7]
```

```cpp
#include <queue>
#include <vector>
#include <climits>
using namespace std;

vector<int> dijkstra(vector<pair<int,int>> adj[],
                     int src, int V) {
    // {distance, vertex}
    priority_queue<pair<int,int>,
                   vector<pair<int,int>>,
                   greater<pair<int,int>>> pq;

    vector<int> dist(V+1, INT_MAX);
    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();

        // Skip if we already found a better path
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
```

**Time Complexity:** O((V + E) log V) with priority queue

**Space Complexity:** O(V)

> **Important:** Dijkstra does NOT work with negative weight edges.
> Use Bellman-Ford for graphs with negative weights.

---

### 8.3 Bellman-Ford Algorithm

Handles **negative weight edges**. Detects negative weight cycles.

**Idea:** Relax all edges V-1 times. If we can still relax on the Vth iteration, a negative cycle exists.

```
Relax means: if dist[u] + w(u,v) < dist[v], update dist[v]

Run V-1 times for all edges:
After each iteration, shortest paths using at most k edges are correct.
```

```cpp
vector<int> bellmanFord(vector<tuple<int,int,int>>& edges,
                         int src, int V) {
    vector<int> dist(V+1, INT_MAX);
    dist[src] = 0;

    // Relax all edges V-1 times
    for (int i = 0; i < V-1; i++) {
        for (auto [u, v, w] : edges) {
            if (dist[u] != INT_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }

    // Check for negative weight cycle
    for (auto [u, v, w] : edges) {
        if (dist[u] != INT_MAX && dist[u] + w < dist[v]) {
            cout << "Negative weight cycle detected!\n";
            return {};
        }
    }
    return dist;
}
```

**Time Complexity:** O(V × E)

**Space Complexity:** O(V)

---

## 9. Minimum Spanning Tree (MST)

A **Minimum Spanning Tree** of a connected weighted undirected graph is a spanning tree with the **minimum total edge weight**.

- **Spanning tree** = connects all V vertices with exactly V-1 edges
- **Minimum** = sum of edge weights is smallest possible

> 📷 **Minimum Spanning Tree:**
> ![MST](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Minimum_spanning_tree.svg/250px-Minimum_spanning_tree.svg.png)

### 9.1 Prim's Algorithm

**Idea:** Grow the MST one vertex at a time. Always add the cheapest edge connecting a vertex in the MST to one outside it.

Uses a **min-heap**.

```
Graph:
    2       3
1 ───── 2 ───── 3
|       |       |
6|      |1     |1
|       |       |
4 ───── 5 ───── 6
    5       4

Prim's from vertex 1:
MST = {1}
Add cheapest edge from {1}: (1,2,w=2) → MST={1,2}
Add cheapest edge from {1,2}: (2,5,w=1) → MST={1,2,5}
Add cheapest from {1,2,5}: (5,6,w=4) or (2,3,w=3) → add (2,3) → MST={1,2,3,5}
...
MST edges: (1,2), (2,5), (2,3), (3,6), (5,4)
Total weight: 2+1+3+1+5 = 12? check...
```

```cpp
int primMST(vector<pair<int,int>> adj[], int V) {
    vector<int>  key(V+1, INT_MAX);    // Min edge weight to reach vertex
    vector<bool> inMST(V+1, false);
    // {weight, vertex}
    priority_queue<pair<int,int>,
                   vector<pair<int,int>>,
                   greater<pair<int,int>>> pq;

    key[1] = 0;
    pq.push({0, 1});
    int mstWeight = 0;

    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();

        if (inMST[u]) continue;
        inMST[u]   = true;
        mstWeight += w;

        for (auto [v, weight] : adj[u]) {
            if (!inMST[v] && weight < key[v]) {
                key[v] = weight;
                pq.push({key[v], v});
            }
        }
    }
    return mstWeight;
}
```

**Time Complexity:** O((V + E) log V)

---

### 9.2 Kruskal's Algorithm

**Idea:** Sort all edges by weight. Greedily add the cheapest edge that doesn't create a cycle. Uses **Union-Find (Disjoint Set Union)**.

```
Sort edges: (2,5,1),(3,6,1),(1,2,2),(2,3,3),(5,6,4),(4,5,5),(1,4,6)

Add (2,5,w=1): no cycle → add
Add (3,6,w=1): no cycle → add
Add (1,2,w=2): no cycle → add
Add (2,3,w=3): no cycle → add
Add (5,6,w=4): creates cycle {2,3,5,6} → skip
Add (4,5,w=5): no cycle → add
MST complete! (V-1 = 5 edges added)
```

```cpp
struct DSU {
    vector<int> parent, rank;

    DSU(int n) : parent(n+1), rank(n+1, 0) {
        for (int i = 0; i <= n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);   // Path compression
        return parent[x];
    }

    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;   // Already connected → cycle!

        // Union by rank
        if (rank[px] < rank[py]) swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }
};

int kruskalMST(vector<tuple<int,int,int>>& edges,
               int V) {
    sort(edges.begin(), edges.end());   // Sort by weight
    DSU dsu(V);
    int mstWeight = 0, edgesUsed = 0;

    for (auto [w, u, v] : edges) {
        if (dsu.unite(u, v)) {
            mstWeight += w;
            edgesUsed++;
            cout << "Add edge (" << u << "," << v
                 << ",w=" << w << ")\n";
            if (edgesUsed == V-1) break;
        }
    }
    return mstWeight;
}
```

**Time Complexity:** O(E log E) (dominated by sorting)

**Space Complexity:** O(V)

---

## 10. Topological Sort

**Topological Sort** is an ordering of vertices in a **Directed Acyclic Graph (DAG)** such that for every directed edge u→v, vertex u comes before v in the ordering.

```
DAG (course prerequisites):
  Math → Physics → Chemistry
  Math → Chemistry
  CS → Physics

Topological order: Math, CS, Physics, Chemistry
(Multiple valid orderings exist)
```

**Applications:**

- Course scheduling
- Build systems (Makefile)
- Package dependency resolution
- Task scheduling with dependencies

### 10.1 Topological Sort using DFS (Kahn's DFS approach)

```cpp
void topoSortDFS(vector<int> adj[], int node,
                 vector<bool>& visited,
                 stack<int>& st) {
    visited[node] = true;
    for (int neighbor : adj[node])
        if (!visited[neighbor])
            topoSortDFS(adj, neighbor, visited, st);
    st.push(node);   // Push AFTER all descendants are processed
}

vector<int> topologicalSort(vector<int> adj[], int V) {
    vector<bool> visited(V+1, false);
    stack<int>   st;

    for (int i = 1; i <= V; i++)
        if (!visited[i])
            topoSortDFS(adj, i, visited, st);

    vector<int> order;
    while (!st.empty()) {
        order.push_back(st.top());
        st.pop();
    }
    return order;
}
```

---

### 10.2 Topological Sort using BFS (Kahn's Algorithm)

Uses **in-degree** array. Repeatedly remove vertices with in-degree 0.

```
DAG: 5→0, 5→2, 4→0, 4→1, 2→3, 3→1

In-degrees: 0→2, 1→2, 2→1, 3→1, 4→0, 5→0

Queue: [4, 5]   (in-degree 0)
Process 4: reduce in-degree of 0,1 → Queue: [5]
Process 5: reduce in-degree of 0,2 → 0's in-degree=0 → Queue: [0,2]
Process 0: no outgoing → Queue: [2]
Process 2: reduce in-degree of 3   → Queue: [3]
Process 3: reduce in-degree of 1   → 1's in-degree=0 → Queue: [1]
Process 1: done

Topological order: 4 5 0 2 3 1
```

```cpp
vector<int> kahnTopSort(vector<int> adj[], int V) {
    vector<int> inDegree(V+1, 0);

    // Calculate in-degrees
    for (int u = 1; u <= V; u++)
        for (int v : adj[u])
            inDegree[v]++;

    queue<int> q;
    for (int i = 1; i <= V; i++)
        if (inDegree[i] == 0)
            q.push(i);

    vector<int> order;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);

        for (int neighbor : adj[node]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0)
                q.push(neighbor);
        }
    }

    // If order.size() != V, graph has a cycle
    if ((int)order.size() != V) {
        cout << "Graph has a cycle — topological sort impossible!\n";
        return {};
    }
    return order;
}
```

**Time Complexity:** O(V + E)

**Space Complexity:** O(V)

---

## 11. Disjoint Set Union (DSU / Union-Find)

DSU is a data structure that efficiently handles:

- **Find:** Which component does this element belong to?
- **Union:** Merge two components

Used extensively in Kruskal's MST and connected components.

```cpp
struct DSU {
    vector<int> parent, rank;

    DSU(int n) : parent(n+1), rank(n+1, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    // Find with path compression
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    // Union by rank
    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }
};
```

**Time Complexity:** Nearly O(1) per operation (amortized O(α(n)) with path compression + union by rank)

---

## 12. Floyd-Warshall (All-Pairs Shortest Path)

Find shortest paths between **all pairs** of vertices.
Works with negative weights but not negative cycles.

```
dist[i][j] = shortest distance from i to j

For each intermediate vertex k:
    for each pair (i, j):
        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

```cpp
void floydWarshall(vector<vector<int>>& dist, int V) {
    // Initialize dist[i][i] = 0, dist[i][j] = INF if no edge

    for (int k = 1; k <= V; k++)
        for (int i = 1; i <= V; i++)
            for (int j = 1; j <= V; j++)
                if (dist[i][k] != INT_MAX &&
                    dist[k][j] != INT_MAX)
                    dist[i][j] = min(dist[i][j],
                                     dist[i][k] + dist[k][j]);
}
```

**Time Complexity:** O(V³)

**Space Complexity:** O(V²)

---

## 13. Time & Space Complexity Summary

| Algorithm       | Time           | Space | Use Case                              |
| --------------- | -------------- | ----- | ------------------------------------- |
| BFS             | O(V+E)         | O(V)  | Unweighted shortest path, level order |
| DFS             | O(V+E)         | O(V)  | Cycle detect, topo sort, components   |
| Dijkstra        | O((V+E)logV)   | O(V)  | SSSP weighted (no neg weights)        |
| Bellman-Ford    | O(V×E)         | O(V)  | SSSP with negative weights            |
| Prim's MST      | O((V+E)logV)   | O(V)  | MST with adjacency list               |
| Kruskal's MST   | O(E logE)      | O(V)  | MST with edge list                    |
| Topo Sort (DFS) | O(V+E)         | O(V)  | DAG ordering                          |
| Kahn's (BFS)    | O(V+E)         | O(V)  | DAG ordering, cycle detect            |
| Floyd-Warshall  | O(V³)          | O(V²) | All-pairs shortest path               |
| DSU find/union  | O(α(n)) ≈ O(1) | O(V)  | Connected components                  |

---

## 14. Important Tips & Common Mistakes

- Always mark vertices as **visited before enqueuing** in BFS, not after dequeuing. Otherwise you may enqueue the same vertex multiple times
- **1-indexed vs 0-indexed**, be consistent. Most CP problems use 1-indexed vertices
- For **disconnected graphs**, always loop over all unvisited vertices to ensure full coverage
- **Dijkstra fails** with negative weight edges, use Bellman-Ford instead
- **Topological sort only works on DAGs**, if the graph has a cycle, it's impossible
- In **cycle detection for directed graphs**, use the recursion stack, the parent trick only works for undirected graphs
- When building a graph, remember to add **both directions** for undirected graphs
- **MST is not unique**, there can be multiple MSTs with the same total weight
- DSU's power comes from **path compression + union by rank**, without them, operations degrade to O(n)
- Always check if a **path actually exists** before printing the shortest distance, `dist = INT_MAX` means unreachable

---

## Assignments

1. **Graph Representation + BFS + DFS.**

   **Task:** Build a graph from edges and implement all three:

   **Part 1 — Graph Representation:**
   Build both adjacency matrix and adjacency list for the same graph. Print both representations.

   **Part 2 — BFS:**
   Perform BFS from vertex 1. Print visited order and shortest distance from source to every vertex.

   **Part 3 — DFS:**
   Perform DFS from vertex 1. Print visited order and count connected components.

   **Build this graph (undirected):**

   ```
   Edges: (1,2),(1,3),(2,4),(2,5),(3,5),(4,6),(7,8)
   Vertices: 1 to 8
   ```

   **Expected output:**

   ```
   Adjacency List:
   1: 2 3
   2: 1 4 5
   3: 1 5
   4: 2 6
   5: 2 3
   6: 4
   7: 8
   8: 7

   BFS from 1: 1 2 3 4 5 6
   BFS distances from 1: [0,1,1,2,2,3,-1,-1]

   DFS from 1: 1 2 4 6 5 3
   Connected components: 2
   ```

   [Solution](./Assignment/code1.cpp)

2. **Cycle Detection + Topological Sort + DSU.**

   **Task:** Solve all three parts on different graphs:

   **Part 1 — Cycle Detection:**
   Detect cycles in both an undirected and a directed graph. Print whether cycle exists.

   **Part 2 — Topological Sort:**
   Given a DAG representing course prerequisites, find a valid course order using both DFS-based and Kahn's (BFS-based) topological sort.

   **Part 3 — DSU Connected Components:**
   Given a list of edges added one by one, after each union operation print the number of connected components.

   **Test with:**

   ```
   Part 1 — Undirected with cycle:
   Edges: (1,2),(2,3),(3,4),(4,2)   → cycle exists
   Edges: (1,2),(2,3),(3,4)         → no cycle

   Part 1 — Directed with cycle:
   Edges: 1→2, 2→3, 3→1            → cycle exists
   Edges: 1→2, 2→3, 1→3            → no cycle

   Part 2 — Courses (DAG):
   6 courses, prerequisites:
   5→0, 5→2, 4→0, 4→1, 2→3, 3→1

   Part 3 — DSU:
   5 vertices, add edges one by one:
   (1,2),(3,4),(2,3),(4,5)
   After each: print component count
   ```

   [Solution](./Assignment/code2.cpp)

3. **Dijkstra's + Kruskal's MST + Bellman-Ford.**

   **Task:** Solve all three parts on weighted graphs:

   **Part 1 — Dijkstra's Shortest Path:**
   Find shortest distances from source to all vertices. Print the distances and reconstruct the shortest path to each vertex.

   **Part 2 — Kruskal's MST:**
   Build the MST using Kruskal's algorithm. Print each edge added and the total MST weight.

   **Part 3 — Bellman-Ford:**
   Run Bellman-Ford on a graph with a negative weight edge. Then add a negative weight cycle and show it is detected.

   **Test with:**

   ```
   Part 1 — Dijkstra:
   Vertices: 5 (1-indexed)
   Edges (u,v,w): (1,2,4),(1,3,2),(2,3,1),(2,4,5),
               (3,4,8),(3,5,10),(4,5,2),(2,5,6)
   Source: 1

   Part 2 — Kruskal MST:
   Vertices: 6
   Edges: (1,2,4),(1,3,3),(2,3,1),(2,4,2),(3,4,4),
       (3,5,3),(4,5,1),(4,6,5),(5,6,6)

   Part 3 — Bellman-Ford:
   Graph 1 (with negative edge, no neg cycle):
   Edges: (0,1,4),(0,2,3),(1,3,2),(1,2,1),
       (2,3,1),(3,4,1),(2,4,5)  ← regular
   Then: change edge (1,3) weight to -2

   Graph 2 (add negative cycle):
   Add edge (3,1,-5) to create cycle 1→3→1
   ```

   [Solution](./Assignment/code3.cpp)
