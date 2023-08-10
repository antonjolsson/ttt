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
    inSemiWinningRow?: boolean
}

export enum GameResult {
    WIN = 'win',
    DRAW = 'draw',
    LOSS = 'loss',
    SEMI_WIN = 'semi-win',
    SEMI_LOSS = 'semi-loss'
}

export interface IGameOutcome {
    outcome: GameResult,
    board: ISquare[],
    depth: number
}

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    semiWinningRow: ISquare[],
    winningRowLength: number
    gridSize: number,
    aiSign?: Player,
    winner?: Player,
    semiWinner?: Player,
    aiLevel: AILevel,
    draw: boolean
}

export interface ISquareEvaluation {
    outcomes: IGameOutcome[],
    wins: number,
    losses: number,
    draws: number,
    semiWins: number, // A semi-win/loss is a sequence like (if win length = 3) [] [X] [X] [X] []
    semiLosses: number,
    winPoints: number,
    drawPoints: number,
    lossPoints: number,
    imminentWin: boolean,
    imminentLoss: boolean,
    points: number
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
    const gridSize = oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[0]
    const board = initBoard(gridSize)
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        semiWinningRow: [] as ISquare[],
        gridSize: gridSize,
        winningRowLength: oldGameState?.winningRowLength ?? GameEngine.ALLOWED_WIN_LENGTHS[0],
        board: board,
        aiSign: oldGameState ? oldGameState.aiSign : Player.CROSS,
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

    /**
     * @param gameState The current IGameState
     * @param checkSemiWins Check for semi-wins or semi-losses as well (only if no win or draw)
     */
    checkForEndCondition(gameState: IGameState, checkSemiWins?: boolean): IGameState {
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

        function getSemiWinSequence(row: ISquare[]): ISquare[] | null {
            for (let i = 0; i <= row.length - winningLength - 1; i++) {
                const sequence = row.slice(i, i + winningLength + 1)
                const headTailSquares = [sequence[0], sequence.slice(-1)[0]]
                const innerSequence = row.slice(1, -1)
                if (headTailSquares.every(square => !square.player)
                    && innerSequence.every(square => square.player === currentPlayer)) {
                    return sequence
                }
            }
            return null
        }

        function onWinningRow(row: ISquare[], semiWin?: boolean): IGameState {
            if (semiWin) {
                gameState.semiWinner = currentPlayer
                row.forEach(square => square.inSemiWinningRow = true)
                return {...gameState, /*semiWinner: currentPlayer,*/ semiWinningRow: row}
            }
            gameState.winner = currentPlayer
            row.forEach(square => square.inWinningRow = true)
            return {...gameState, /*winner: currentPlayer,*/ winningRow: row}
        }

        // Semi-wins are only possible if gridSize - winningLength >= 1
        for (const checkingSemiWins of (checkSemiWins && gridSize - winningLength >= 1) ? [false,  true] : [false]) {

            // Check for (semi) winner horizontally
            for (let i = 0; i < gridSize * gridSize; i += gridSize) {
                const row = board.slice(i, i + gridSize)
                const sequence = checkingSemiWins ? getSemiWinSequence(row) : getWinSequence(row)
                if (sequence) {
                    return onWinningRow(sequence, checkingSemiWins)
                }
            }

            // Check vertically
            for (let column = 0; column < gridSize; column++) {
                const row = board.filter((_, i) => i % gridSize === column)
                const sequence = checkingSemiWins ? getSemiWinSequence(row) : getWinSequence(row)
                if (sequence) {
                    return onWinningRow(sequence, checkingSemiWins)
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
                    winSequence = checkingSemiWins ? getSemiWinSequence(seq) : getWinSequence(seq)
                    if (winSequence) {
                        return onWinningRow(winSequence, checkingSemiWins)
                    }

                    // Check diagonally ne - sw
                    const mirroredCol = gridSize - 1 - col
                    startIndex = row * gridSize + mirroredCol
                    offset = startIndex % (gridSize - 1)
                    seq = board.filter((_, j) => j >= startIndex
                        && (j === startIndex || j % gridSize < mirroredCol)
                        && j % (gridSize - 1) === offset)
                    winSequence = checkingSemiWins ? getSemiWinSequence(seq) : getWinSequence(seq)
                    if (winSequence) {
                        return onWinningRow(winSequence, checkingSemiWins)
                    }
                }
            }

            if (!checkingSemiWins) {
                // No winner, check for draw
                const draw = board.every(square => square.player)
                if (draw) {
                    gameState.draw = true
                    return gameState
                }
            }
        }

        return gameState
    }

    update(gameState: IGameState): void {
        gameState = this.checkForEndCondition(gameState)
        if (!gameState.winner && !gameState.draw) {
            gameState.currentPlayer = GameEngine.getNextPlayer(gameState.currentPlayer)

            if (gameState.currentPlayer === gameState.aiSign) {
                this._ai.move(gameState)
                this.update(gameState)
            }
        }
    }

    static getNextPlayer(currentPlayer: Player): Player {
        return currentPlayer === Player.CROSS ? Player.CIRCLE : Player.CROSS;
    }
}
