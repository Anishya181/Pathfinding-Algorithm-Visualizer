export interface Node {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isWall: boolean;
    distance: number; 
    gScore: number;   
    fScore: number;   
    isVisited: boolean;
    previousNode: Node | null;
}