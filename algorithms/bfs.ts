// algorithms/bfs.ts
import { Node } from '@/types';

export function bfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const queue: Node[] = []; // Use a queue (FIFO) for BFS

    startNode.isVisited = true;
    queue.push(startNode);

    while (queue.length > 0) {
        const currentNode = queue.shift(); // Dequeue the first node
        if (!currentNode) continue;

        visitedNodesInOrder.push(currentNode);

        if (currentNode === finishNode) {
            return visitedNodesInOrder;
        }

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            neighbor.isVisited = true;
            neighbor.previousNode = currentNode;
            queue.push(neighbor);
        }
    }

    // Return visited nodes even if path is not found
    return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;

    // Up
    if (row > 0) neighbors.push(grid[row - 1][col]);
    // Down
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    // Left
    if (col > 0) neighbors.push(grid[row][col - 1]);
    // Right
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    // Filter out walls and already visited nodes
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}