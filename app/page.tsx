import Grid from '@/components/Grid';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-900">
      <div className="w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Pathfinding Algorithm Visualizer
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          
          <div className="flex items-center gap-2">
            <label htmlFor="algorithm-select" className="font-bold text-white">Algorithm:</label>
            <select id="algorithm-select" className="bg-gray-700 text-white font-bold py-2 px-3 rounded">
              <option value="dijkstra">Dijkstra's</option>
              <option value="astar">A* Search</option>
              <option value="bfs">BFS</option>
              <option value="dfs">DFS</option>
            </select>
          </div>

          <button id="visualize-button" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            Visualize!
          </button>

          <div className="flex gap-4">
            <button id="clear-path-button" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
              Clear Path
            </button>
             <button id="clear-board-button" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
              Clear Board
            </button>
          </div>

        </div>
      </div>
      <Grid />
    </main>
  );
}