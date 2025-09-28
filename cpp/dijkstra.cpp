#include <vector>
#include <queue>
#include <emscripten/emscripten.h>

// Using a simple struct for nodes
struct Node {
    int row, col, dist;
    // For priority queue ordering
    bool operator>(const Node& other) const {
        return dist > other.dist;
    }
};

// This tells the C++ compiler to make this function visible to the outside world (JS)
// without changing its name, which C++ compilers sometimes do.
extern "C" {

// EMSCRIPTEN_KEEPALIVE prevents the compiler from removing this function,
// ensuring it can be called from JavaScript.
EMSCRIPTEN_KEEPALIVE
int* dijkstra(int* grid_ptr, int rows, int cols, int startRow, int startCol) {
    // Convert the raw pointer to a 2D vector for easier use
    std::vector<std::vector<int>> grid(rows, std::vector<int>(cols));
    int startNodeIndex = -1;
    int endNodeIndex = -1;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            grid[r][c] = grid_ptr[r * cols + c];
            if (grid[r][c] == 2) startNodeIndex = r * cols + c;
            if (grid[r][c] == 3) endNodeIndex = r * cols + c;
        }
    }

    // Parent array to reconstruct the path
    std::vector<int> parent(rows * cols, -1);
    std::vector<int> dist(rows * cols, -1);
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> pq;

    int startIdx = startRow * cols + startCol;
    dist[startIdx] = 0;
    pq.push({startRow, startCol, 0});

    int dr[] = {-1, 1, 0, 0}; // Directions: Up, Down, Left, Right
    int dc[] = {0, 0, -1, 1};

    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();

        int r = current.row;
        int c = current.col;
        int d = current.dist;
        int u = r * cols + c;

        if (d > dist[u] && dist[u] != -1) continue;
        if (grid[r][c] == 3) break; // Found the end node

        for (int i = 0; i < 4; ++i) {
            int newRow = r + dr[i];
            int newCol = c + dc[i];
            int v = newRow * cols + newCol;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && grid[newRow][newCol] != 1) {
                if (dist[v] == -1 || dist[u] + 1 < dist[v]) {
                    dist[v] = dist[u] + 1;
                    parent[v] = u;
                    pq.push({newRow, newCol, dist[v]});
                }
            }
        }
    }

    // Reconstruct path and store it in a static buffer to return to JS
    static std::vector<int> path;
    path.clear();
    int crawl = endNodeIndex;
    if (parent[crawl] != -1 || crawl == startNodeIndex) {
        while (crawl != -1) {
            path.push_back(crawl % cols); // col
            path.push_back(crawl / cols); // row
            crawl = parent[crawl];
        }
    }

    // Add a -1 at the end to signify the end of the path data for JS
    path.push_back(-1);

    return path.data();
}

} // extern "C"