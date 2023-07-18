import {IGameState} from "./App";

export enum Player {
    CROSS = 'x',
    CIRCLE = 'o',
}

export enum AILevel {
    EASY = 'easy',
    HARD = 'hard'
}

export interface ISquare {
    player?: Player,
    inWinningRow?: boolean
}

// TODO: Move inside class
export function initBoard(gridSize: number): ISquare[] {
    const board: ISquare[] = []
    for (let i = 0; i < gridSize * gridSize; i++) {
        const square: ISquare = {player: undefined}
        board.push(square)
    }
    return board
}

export function getInitialGameState(): IGameState {
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        gridSize: 3,
        board: initBoard(3),
        ai: Player.CIRCLE,
        aiLevel: AILevel.EASY
    };
}

export class GameEngine {
    constructor(private _gameState: IGameState) {}

    set gameState(value: IGameState) {
        this._gameState = value;
    }

    private checkAllRows(): void {
        const board = this._gameState.board
        const gridSize = this._gameState.gridSize
        const currentPlayer = this._gameState.currentPlayer

        // Check horizontally
        for (let i = 0; i < gridSize * gridSize; i += gridSize) {
            const row = board.slice(i, i + gridSize)
            if (row.every(square => square.player === currentPlayer)) {
                this.onWinningRow(currentPlayer, row);
                return
            }
        }

        // Check vertically
        for (let i = 0; i < gridSize; i++) {
            const row = board.filter((_, j) => j % gridSize === i)
            if (row.every(square => square.player === currentPlayer)) {
                this.onWinningRow(currentPlayer, row);
                return;
            }
        }

        // Check diagonally
        let row = board.filter((_, j) => j % 4 === 0)
        if (row.every(square => square.player === currentPlayer)) {
            this.onWinningRow(currentPlayer, row);
        }
        row = board.filter((_, j) => j !== 0 && j < gridSize * gridSize - 1 && j % (gridSize - 1) === 0)
        if (row.every(square => square.player === currentPlayer)) {
            this.onWinningRow(currentPlayer, row);
            return;
        }
    }

    private onWinningRow(currentPlayer: Player, row: ISquare[]): void {
        this._gameState.winner = currentPlayer
        row.forEach(square => square.inWinningRow = true)
        this._gameState = {...this._gameState, winner: currentPlayer, winningRow: row}
    }

    update(): IGameState {
        this.checkAllRows()
        if (!this._gameState.winner) {
            this._gameState.currentPlayer = this._gameState.currentPlayer === Player.CROSS ? Player.CIRCLE : Player.CROSS
        }
        return this._gameState
    }
}
