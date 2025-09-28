import { Node } from '@/types';

// Breadth-First Search Algorithm
export function bfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const queue: Node[] = []; // BFS uses a queue (FIFO)

    startNode.isVisited = true;
    queue.push(startNode);

    while (queue.length > 0) {
        const currentNode = queue.shift(); // Get first node in queue
        if (!currentNode) continue;

        visitedNodesInOrder.push(currentNode);

        // Stop when target is found
        if (currentNode === finishNode) return visitedNodesInOrder;

        // Explore unvisited neighbors
        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            neighbor.isVisited = true;
            neighbor.previousNode = currentNode;
            queue.push(neighbor); // Add neighbor to queue
        }
    }

    // Return visited nodes if no path exists
    return visitedNodesInOrder;
}

// Get neighbors that are not walls and not visited
function getUnvisitedNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);          // Up
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]);          // Left
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right

    return neighbors.filter(n => !n.isVisited && !n.isWall);
}
