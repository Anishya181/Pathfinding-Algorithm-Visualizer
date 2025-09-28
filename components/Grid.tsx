// components/Grid.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { Node } from '@/types';
import { dijkstra as dijkstraJS, getNodesInShortestPathOrder } from '@/algorithms/dijkstra';
import { bfs } from '@/algorithms/bfs';
import { astar } from '@/algorithms/astar';
import { dfs } from '@/algorithms/dfs'; // Import DFS

const NUM_ROWS = 20;
const NUM_COLS = 50;
const START_NODE_ROW = 10;
const START_NODE_COL = 5;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 45;

declare global { interface Window { Module: any; } }

const createInitialGrid = (): Node[][] => {
  const grid: Node[][] = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push({
        row, col,
        isStart: row === START_NODE_ROW && col === START_NODE_COL,
        isEnd: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
        isWall: false, distance: Infinity, isVisited: false, previousNode: null,
        gScore: Infinity, fScore: Infinity,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

const Grid = () => {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [wasmDijkstra, setWasmDijkstra] = useState<((...args: any[]) => any) | null>(null);

  useEffect(() => { setGrid(createInitialGrid()); }, []);

  // --- Wasm Loading ---
  const setupWasm = () => {
    if (!window.Module) return;
    const dijkstraFunc = window.Module.cwrap('dijkstra', 'number', ['array', 'number', 'number', 'number', 'number']);
    setWasmModule(window.Module);
    setWasmDijkstra(() => dijkstraFunc);
  };
  const handleWasmLoad = () => {
    if (window.Module?.calledRun) setupWasm();
    else window.Module = { ...window.Module, onRuntimeInitialized: setupWasm };
  };

  // --- Main Visualization Handler ---
  const handleVisualize = () => {
    if (isVisualizing) return;
    clearPath();
    setIsVisualizing(true);
    if (selectedAlgorithm === 'dijkstra') visualizeDijkstra();
    else if (selectedAlgorithm === 'bfs') visualizeBfs();
    else if (selectedAlgorithm === 'astar') visualizeAstar();
    else if (selectedAlgorithm === 'dfs') visualizeDfs(); // Add DFS case
  };

  const visualizeDijkstra = () => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstraJS(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const visualizeBfs = () => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = bfs(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const visualizeAstar = () => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = astar(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const visualizeDfs = () => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dfs(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const visualizeWasmDijkstra = useCallback(() => {
    if (!wasmDijkstra || !wasmModule || isVisualizing) return;
    clearPath();
    setIsVisualizing(true);
    const flatGrid = grid.flat().map(node => {
        if (node.isStart) return 2; if (node.isEnd) return 3; if (node.isWall) return 1; return 0;
    });
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const pathPtr = wasmDijkstra(flatGrid, NUM_ROWS, NUM_COLS, startNode.row, startNode.col);
    const path = [];
    for (let i = pathPtr / 4; ; i += 2) {
      const col = wasmModule.HEAP32[i]; const row = wasmModule.HEAP32[i + 1];
      if (row === -1) break;
      path.push({ row, col });
    }
    const nodesInShortestPathOrder = path.map(p => grid[p.row][p.col]);
    animateShortestPath(nodesInShortestPathOrder);
  }, [grid, wasmDijkstra, wasmModule, isVisualizing]);

  // --- UI Event Handlers and Helpers ---
  useEffect(() => {
    const visualizeButton = document.getElementById('visualize-button') as HTMLButtonElement;
    const wasmButton = document.getElementById('visualize-button-wasm') as HTMLButtonElement;
    const algorithmSelect = document.getElementById('algorithm-select') as HTMLSelectElement;
    const clearBoardButton = document.getElementById('clear-board-button');
    const clearPathButton = document.getElementById('clear-path-button');

    if (visualizeButton) visualizeButton.onclick = handleVisualize;
    if (wasmButton) { wasmButton.onclick = visualizeWasmDijkstra; wasmButton.disabled = !wasmDijkstra || isVisualizing; }
    if (algorithmSelect) algorithmSelect.onchange = (e) => setSelectedAlgorithm((e.target as HTMLSelectElement).value);
    if (clearBoardButton) clearBoardButton.onclick = clearBoard;
    if (clearPathButton) clearPathButton.onclick = clearPath;
  }, [grid, wasmDijkstra, visualizeWasmDijkstra, isVisualizing, selectedAlgorithm]);

  const handleMouseDown = (row: number, col: number) => { if (isVisualizing) return; const newGrid = getNewGridWithWallToggled(grid, row, col); setGrid(newGrid); setIsMouseDown(true); };
  const handleMouseEnter = (row: number, col: number) => { if (!isMouseDown || isVisualizing) return; const newGrid = getNewGridWithWallToggled(grid, row, col); setGrid(newGrid); };
  const handleMouseUp = () => setIsMouseDown(false);
  const getNewGridWithWallToggled = (grid: Node[][], row: number, col: number): Node[][] => {
    const newGrid = grid.map(r => r.slice()); const node = newGrid[row][col];
    if (!node.isStart && !node.isEnd) newGrid[row][col] = { ...node, isWall: !node.isWall };
    return newGrid;
  };

  const clearBoard = () => { if (isVisualizing) return; setGrid(createInitialGrid()); };
  const clearPath = () => {
    if (isVisualizing) return;
    const newGrid = grid.map(row => row.map(node => ({ ...node, isVisited: false, distance: Infinity, previousNode: null, gScore: Infinity, fScore: Infinity })));
    setGrid(newGrid);
    const nodes = document.querySelectorAll('.node-visited, .node-shortest-path');
    nodes.forEach(node => { node.className = node.className.replace(' node-visited', '').replace(' node-shortest-path', ''); });
  };

  // --- Animation Functions ---
  const animateAlgorithm = (visitedNodesInOrder: Node[], nodesInShortestPathOrder: Node[]) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => animateShortestPath(nodesInShortestPathOrder, visitedNodesInOrder.length), 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if(nodeElement && !node.isStart && !node.isEnd) nodeElement.className += ' node-visited';
      }, 10 * i);
    }
  };
  const animateShortestPath = (nodesInShortestPathOrder: Node[], visitedNodesCount: number = 0) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if(nodeElement && !node.isStart && !node.isEnd) {
          nodeElement.className = nodeElement.className.replace(' node-visited', '');
          nodeElement.className += ' node-shortest-path';
        }
      }, 50 * i);
    }
    const totalAnimationTime = (visitedNodesCount * 10) + (nodesInShortestPathOrder.length * 50);
    setTimeout(() => setIsVisualizing(false), totalAnimationTime);
  };

  return (
    <>
      <Script src="/dijkstra.js" strategy="lazyOnload" onLoad={handleWasmLoad} />
      <div className="grid border-2 border-cyan-400" style={{ display: 'grid', gridTemplateColumns: `repeat(${NUM_COLS}, 25px)` }} onMouseUp={handleMouseUp}>
        {grid.map((row) => row.map((node, nodeIndex) => {
          const { row, col, isStart, isEnd, isWall } = node;
          const extraClassName = isEnd ? 'bg-red-500' : isStart ? 'bg-green-500' : isWall ? 'bg-gray-800 animate-wall' : 'bg-white';
          return (
            <div key={nodeIndex} id={`node-${row}-${col}`} className={`w-[25px] h-[25px] border border-cyan-200 ${extraClassName}`}
              onMouseDown={() => handleMouseDown(row, col)} onMouseEnter={() => handleMouseEnter(row, col)}></div>
          );
        }))}
      </div>
    </>
  );
};

export default Grid;