// algorithms/dfs.ts
import { Node } from '@/types';

export function dfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const stack: Node[] = []; // Use a stack (LIFO) for DFS

    stack.push(startNode);

    while (stack.length > 0) {
        const currentNode = stack.pop(); // Pop the last node from the stack
        
        // Skip if node is null, already visited, or a wall
        if (!currentNode || currentNode.isVisited || currentNode.isWall) continue;

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        if (currentNode === finishNode) {
            return visitedNodesInOrder;
        }

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            neighbor.previousNode = currentNode;
            stack.push(neighbor);
        }
    }

    // Return visited nodes even if path is not found
    return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;
    
    // The order neighbors are added to the stack can affect the path's appearance.
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
    if (row > 0) neighbors.push(grid[row - 1][col]); // Up
    if (col > 0) neighbors.push(grid[row][col - 1]); // Left
    
    // CORRECTED: Filter out neighbors that are walls or have already been visited.
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}