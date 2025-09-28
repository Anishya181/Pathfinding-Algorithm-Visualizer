import { Node } from '@/types';

// Depth-First Search Algorithm
export function dfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const stack: Node[] = []; // DFS uses a stack (LIFO)

    stack.push(startNode);

    while (stack.length > 0) {
        const currentNode = stack.pop(); // Get last node from stack

        // Skip invalid nodes
        if (!currentNode || currentNode.isVisited || currentNode.isWall) continue;

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        // Stop when target is reached
        if (currentNode === finishNode) return visitedNodesInOrder;

        // Explore neighbors (push onto stack for LIFO order)
        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            neighbor.previousNode = currentNode;
            stack.push(neighbor);
        }
    }

    // Return explored nodes if no path exists
    return visitedNodesInOrder;
}

// Get neighbors in fixed order (down, right, up, left)
function getUnvisitedNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;

    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);     // Down
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
    if (row > 0) neighbors.push(grid[row - 1][col]);                  // Up
    if (col > 0) neighbors.push(grid[row][col - 1]);                  // Left

    return neighbors.filter(n => !n.isVisited && !n.isWall);
}
