import { Node } from '@/types';

// Dijkstra's Algorithm
export function dijkstra(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    startNode.distance = 0; // Distance from start to itself is 0

    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length > 0) {
        sortNodesByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift();

        if (!closestNode || closestNode.isWall) continue; // Skip invalid nodes

        // Stop if remaining nodes are unreachable
        if (closestNode.distance === Infinity) return visitedNodesInOrder;

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);

        // Stop when target is reached
        if (closestNode === finishNode) return visitedNodesInOrder;

        updateUnvisitedNeighbors(closestNode, grid);
    }

    return visitedNodesInOrder;
}

// Sort nodes so the closest (smallest distance) comes first
function sortNodesByDistance(unvisitedNodes: Node[]) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
}

// Update neighbors with new shortest distances
function updateUnvisitedNeighbors(node: Node, grid: Node[][]) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = node.distance + 1; // Edge weight = 1
        neighbor.previousNode = node;
    }
}

// Get neighbors that haven't been visited yet
function getUnvisitedNeighbors(node: Node, grid: Node[][]) {
    const neighbors: Node[] = [];
    const { col, row } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);          // Up
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]);          // Left
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right

    return neighbors.filter(n => !n.isVisited);
}

// Collect all nodes from the grid into a single list
function getAllNodes(grid: Node[][]): Node[] {
    const nodes: Node[] = [];
    for (const row of grid) {
        for (const node of row) nodes.push(node);
    }
    return nodes;
}

// Backtrack from finishNode to build the shortest path
export function getNodesInShortestPathOrder(finishNode: Node) {
    const nodesInShortestPathOrder: Node[] = [];
    let currentNode: Node | null = finishNode;

    while (currentNode) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}
