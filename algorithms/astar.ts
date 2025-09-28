// algorithms/astar.ts

// If you created a shared types file:
import { Node } from '@/types';

// If you did NOT create a shared types file, define the Node interface here:
/*
interface Node {
    row: number; col: number; isStart: boolean; isEnd: boolean; isWall: boolean;
    distance: number; gScore: number; fScore: number;
    isVisited: boolean; previousNode: Node | null;
}
*/

// A* Search Algorithm
export function astar(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const openSet: Node[] = []; // Nodes to be evaluated

    // Initialize scores for all nodes
    for (const row of grid) {
        for (const node of row) {
            node.gScore = Infinity;
            node.fScore = Infinity;
        }
    }

    startNode.gScore = 0;
    startNode.fScore = heuristic(startNode, finishNode);
    openSet.push(startNode);

    while (openSet.length > 0) {
        // Sort the open set to get the node with the lowest fScore
        openSet.sort((a, b) => a.fScore - b.fScore);
        const currentNode = openSet.shift();

        if (!currentNode || currentNode.isWall) continue;
        
        // If we pop a node that's already visited, skip it
        if(currentNode.isVisited) continue;
        
        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        
        if (currentNode === finishNode) {
            return visitedNodesInOrder;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            // tentative_gScore is the distance from start to the neighbor through current
            const tentativeGScore = currentNode.gScore + 1; // 1 is the distance between neighbors

            if (tentativeGScore < neighbor.gScore) {
                // This path to neighbor is better than any previous one. Record it!
                neighbor.previousNode = currentNode;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = neighbor.gScore + heuristic(neighbor, finishNode);
                
                // Add neighbor to the open set if it's not already there
                if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    
    // Return visited nodes even if no path is found
    return visitedNodesInOrder;
}

// Heuristic function (Manhattan distance)
function heuristic(nodeA: Node, nodeB: Node): number {
    const dx = Math.abs(nodeA.col - nodeB.col);
    const dy = Math.abs(nodeA.row - nodeB.row);
    return dx + dy;
}

function getNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors: Node[] = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isWall);
}