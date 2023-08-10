import {EasyAI, HardAI, IAI} from "./AI";

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
    inWinningRow?: boolean,
}

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    semiWinningRow: ISquare[],
    winningRowLength: number
    gridSize: number,
    aiPlayer?: Player,
    winner?: Player,
    semiWinner?: Player,
    aiLevel: AILevel,
    draw: boolean
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

export function getInitialGameState(oldGameState?: IGameState): IGameState {
    const gridSize = oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[2]
    const board = initBoard(gridSize)
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        semiWinningRow: [] as ISquare[],
        gridSize: gridSize,
        winningRowLength: oldGameState?.winningRowLength ?? GameEngine.ALLOWED_WIN_LENGTHS[0],
        board: board,
        aiPlayer: oldGameState ? oldGameState.aiPlayer : Player.CROSS,
        aiLevel: oldGameState?.aiLevel ?? AILevel.HARD,
        draw: false
    };
}

export class GameEngine {
    constructor(aiLevel: AILevel) {
        this._ai = aiLevel === AILevel.EASY ? new EasyAI() : new HardAI(this.checkForEndCondition)
    }

    static ALLOWED_GRID_SIZES = [3, 4, 5, 6, 7]
    static ALLOWED_WIN_LENGTHS = [3, 4]

    private _ai: IAI

    set ai(level: AILevel) {
        this._ai = level === AILevel.EASY ? new EasyAI() : new HardAI(this.checkForEndCondition);
    }

    static getMidSquare(gridSize: number): number {
        const index = Math.floor(gridSize / 2)
        return (gridSize + 1) * index;
    }

    checkForEndCondition(gameState: IGameState): IGameState {
        const board = gameState.board
        const gridSize = gameState.gridSize
        const currentPlayer = gameState.currentPlayer
        const winningLength = Math.min(gameState.winningRowLength, gridSize)

        function getWinSequence(row: ISquare[]): ISquare[] | null {
            for (let i = 0; i <= row.length - winningLength; i++) {
                const sequence = row.slice(i, i + winningLength)
                if (sequence.every(square => square.player === currentPlayer)) {
                    return sequence
                }
            }
            return null
        }

        function onWinningRow(row: ISquare[]): IGameState {
            gameState.winner = currentPlayer
            row.forEach(square => square.inWinningRow = true)
            return {...gameState, winningRow: row}
        }

        for (let i = 0; i < gridSize * gridSize; i += gridSize) {
            const row = board.slice(i, i + gridSize)
            const sequence = getWinSequence(row)
            if (sequence) {
                return onWinningRow(sequence)
            }
        }

        // Check vertically
        for (let column = 0; column < gridSize; column++) {
            const row = board.filter((_, i) => i % gridSize === column)
            const sequence = getWinSequence(row)
            if (sequence) {
                return onWinningRow(sequence)
            }
        }

        let seq: ISquare[] = []
        let winSequence: ISquare[] | null = null

        for (let row = 0; row <= gridSize - winningLength; row++) {
            for (let col = 0; col <= gridSize - winningLength; col++) {
                // Check diagonally nw - se
                let startIndex = row * gridSize + col
                let offset = startIndex % (gridSize + 1)
                seq = board.filter((_, j) => j >= startIndex && j % (gridSize + 1) === offset)
                winSequence = getWinSequence(seq)
                if (winSequence) {
                    return onWinningRow(winSequence)
                }

                // Check diagonally ne - sw
                const mirroredCol = gridSize - 1 - col
                startIndex = row * gridSize + mirroredCol
                offset = startIndex % (gridSize - 1)
                seq = board.filter((_, j) => j >= startIndex
                    && (j === startIndex || j % gridSize < mirroredCol)
                    && j % (gridSize - 1) === offset)
                winSequence = getWinSequence(seq)
                if (winSequence) {
                    return onWinningRow(winSequence)
                }
            }
        }

        // No winner, check for draw
        const draw = board.every(square => square.player)
        if (draw) {
            gameState.draw = true
            return gameState
        }

        return gameState
    }

    update(gameState: IGameState): void {
        gameState = this.checkForEndCondition(gameState)
        if (!gameState.winner && !gameState.draw) {
            gameState.currentPlayer = GameEngine.getNextPlayer(gameState.currentPlayer)

            if (gameState.currentPlayer === gameState.aiPlayer) {
                this._ai.move(gameState)
                this.update(gameState)
            }
        }
    }

    static getNextPlayer(currentPlayer: Player): Player {
        return currentPlayer === Player.CROSS ? Player.CIRCLE : Player.CROSS;
    }
}
