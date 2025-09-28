import { Node } from '@/types';

// A* Search Algorithm
export function astar(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const openSet: Node[] = []; // Nodes yet to be explored

    // Initialize all nodes with infinite scores
    for (const row of grid) {
        for (const node of row) {
            node.gScore = Infinity;
            node.fScore = Infinity;
        }
    }

    // Start node setup
    startNode.gScore = 0;
    startNode.fScore = heuristic(startNode, finishNode);
    openSet.push(startNode);

    while (openSet.length > 0) {
        // Pick node with lowest fScore
        openSet.sort((a, b) => a.fScore - b.fScore);
        const currentNode = openSet.shift();

        if (!currentNode || currentNode.isWall) continue;
        if (currentNode.isVisited) continue; // Skip if already processed

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        // Stop if we reached the target
        if (currentNode === finishNode) return visitedNodesInOrder;

        // Explore neighbors
        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            const tentativeGScore = currentNode.gScore + 1; // uniform edge cost

            // Found a better path to this neighbor
            if (tentativeGScore < neighbor.gScore) {
                neighbor.previousNode = currentNode;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = tentativeGScore + heuristic(neighbor, finishNode);

                // Add neighbor if not already in open set
                if (!openSet.some(n => n.row === neighbor.row && n.col === neighbor.col)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // Return explored nodes if no path exists
    return visitedNodesInOrder;
}

// Heuristic: Manhattan distance
function heuristic(nodeA: Node, nodeB: Node): number {
    return Math.abs(nodeA.col - nodeB.col) + Math.abs(nodeA.row - nodeB.row);
}

// Get valid neighboring nodes (up, down, left, right)
function getNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    return neighbors.filter(n => !n.isWall);
}