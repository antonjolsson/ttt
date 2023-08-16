import {GameEngine, IGameState, ISquare, Player} from "./GameEngine";

enum AIStrategy {
    MAXIMIZING = 'maximizing', MINIMIZING = 'minimizing'
}

interface ISquareData {
    square: ISquare,
    index: number
}

export interface IAI {
    move: (gameState: IGameState) => void
}

export class EasyAI implements IAI {
    move(gameState: IGameState): void {
        const freeSquares = gameState.board.filter(sq => !sq.player)
        const index = Math.floor(freeSquares.length * Math.random())
        freeSquares[index].player = gameState.currentPlayer
    }
}

function boardAsString(gameState: IGameState): string {
    let str = '\n'
    for (let i = 0; i < gameState.gridSize; i++) {
        str += gameState.board.slice(i * gameState.gridSize, (i + 1) * gameState.gridSize)
            .map(sq => sq.player ?? '.').join(' ') + '\n'
    }
    return str
}

export class HardAI implements IAI {
    private static WIN_POINTS = 20
    private static DEPTH_POINTS = 1
    private gridSizeToRecursionDepth = new Map<number, number>([
        [3, 9],
        [4, 7],
        [5, 6],
        [6, 3],
        [7, 3],
    ])

    constructor(private checkForEndCondition: (gameState: IGameState) => IGameState) {}

    move(gameState: IGameState): void {
        const gridSize = gameState.gridSize
        const midSquare = GameEngine.getMidSquare(gridSize)

        // If empty board, hard-code AI to choose center square
        if (gameState.board.every(sq => !sq.player)) {
            gameState.board[midSquare].player = gameState.aiPlayer
            return
        }

        // If gridSize > 4 && first move was midSquare, pick diagonal adjacent square
        if (gridSize >= 4 && gameState.board.filter(sq => sq.player).length === 1) {
            if (gameState.board[midSquare].player) {
                gameState.board[midSquare - gridSize - 1].player = gameState.aiPlayer
                return
            } else if (gridSize % 2 === 0 && gameState.board[midSquare - 1].player) {
                gameState.board[midSquare - gridSize].player = gameState.aiPlayer
                return
            } else if (gridSize % 2 === 0 && gameState.board[midSquare - gridSize].player) {
                gameState.board[midSquare - 1].player = gameState.aiPlayer
                return
            } else if (gridSize % 2 === 0 && gameState.board[midSquare - gridSize - 1].player) {
                gameState.board[midSquare].player = gameState.aiPlayer
                return
                // If gridSize = 5 or 7 && first move was adjacent to midSquare, pick adjacent square
            } else if (gridSize % 2 === 1) {
                const occupiedSquareIndex = gameState.board.findIndex(sq => sq.player)
                const dist = Math.abs(midSquare - occupiedSquareIndex)
                if (dist === 1 || dist === gridSize || dist === gridSize + 1 || dist === gridSize - 1) {
                    gameState.board[midSquare].player = gameState.aiPlayer
                    return
                }
            }
        }

        let squaresData = this.getFreeSquaresData(gameState)
        if (gridSize > 3) {
            squaresData = this.getAdjacentSquaresData(squaresData, gameState);
        }

        const strategy = gameState.aiPlayer === Player.CROSS ? AIStrategy.MAXIMIZING : AIStrategy.MINIMIZING

        let bestSquare = -1
        let bestSquarePoints = strategy === AIStrategy.MAXIMIZING ? -Infinity : Infinity

        squaresData.map(data => data.index).forEach(i => {
            const newState = JSON.parse(JSON.stringify(gameState))
            newState.board[i].player = gameState.aiPlayer
            const opponentStrategy = strategy === AIStrategy.MAXIMIZING ? AIStrategy.MINIMIZING : AIStrategy.MAXIMIZING
            const points = this.miniMax(newState, 0, opponentStrategy, -Infinity, Infinity)
            if ((strategy === AIStrategy.MAXIMIZING && points > bestSquarePoints)
                || (strategy === AIStrategy.MINIMIZING && points < bestSquarePoints)) {
                bestSquarePoints = points
                bestSquare = i
            }
            // console.log(`Index: ${i}, points: ${points}`)
        })

        // console.log(`Best square: ${bestSquare}`)
        gameState.board[bestSquare].player = gameState.aiPlayer
    }

    private getFreeSquaresData(gameState: IGameState): ISquareData[] {
        return gameState.board
            .map((sq, i) => {
                return {square: sq, index: i}
            })
            .filter(data => !data.square.player)

    }

    private getAdjacentSquaresData(freeSquaresData: ISquareData[], gameState: IGameState): ISquareData[] {
        const occupiedSquaresData = gameState.board.map((sq, i) => {
                return {square: sq, index: i}
            })
            .filter(data => data.square.player)
        return freeSquaresData.filter(data => {
            const iF = data.index
            const {row: fRow, col: fCol} = this.getRowAndColumnFromIndex(iF, gameState.gridSize);

            // Check if this free square is adjacent to some occupied square
            return occupiedSquaresData.some(oData => {
                const iO = oData.index
                const {row: oRow, col: oCol} = this.getRowAndColumnFromIndex(iO, gameState.gridSize);

                return (Math.abs(oRow - fRow) <= 1
                    && Math.abs(oCol - fCol) <= 1)
            })
        })
    }

    miniMax(gameState: IGameState, depth: number, strategy: AIStrategy, alpha: number, beta: number): number {
        gameState = this.checkForEndCondition(gameState)
        if (depth === this.gridSizeToRecursionDepth.get(gameState.gridSize) || gameState.draw) {
            return 0
        }
        if (gameState.winner === Player.CROSS) {
            return HardAI.WIN_POINTS - depth * HardAI.DEPTH_POINTS
        }
        if (gameState.winner === Player.CIRCLE) {
            return -HardAI.WIN_POINTS + depth * HardAI.DEPTH_POINTS
        }

        let squaresData = this.getFreeSquaresData(gameState)
        if (gameState.gridSize > 3) {
            squaresData = this.getAdjacentSquaresData(squaresData, gameState)
        }

        if (strategy === AIStrategy.MAXIMIZING) {
            let bestVal = -Infinity
            for (const data of squaresData) {
                const newState = JSON.parse(JSON.stringify(gameState)) as IGameState
                newState.board[data.index].player = Player.CROSS
                newState.currentPlayer = Player.CROSS
                const value = this.miniMax(newState, depth + 1, AIStrategy.MINIMIZING, alpha, beta)
                bestVal = Math.max(bestVal, value)
                alpha = Math.max(alpha, bestVal)
                if (beta <= alpha) {
                    break
                }
            }
            return bestVal
        }

        // strategy = AIStrategy.MINIMIZING
        let bestVal = Infinity
        for (const data of squaresData) {
            const newState = JSON.parse(JSON.stringify(gameState)) as IGameState
            newState.board[data.index].player = Player.CIRCLE
            newState.currentPlayer = Player.CIRCLE
            const value = this.miniMax(newState, depth + 1, AIStrategy.MAXIMIZING, alpha, beta)
            bestVal = Math.min(bestVal, value)
            beta = Math.min(beta, bestVal)
            if (beta <= alpha) {
                break
            }
        }
        return bestVal
    }

    private getRowAndColumnFromIndex(index: number, gridSize: number): { row: number, col: number } {
        return {row: Math.floor(index / gridSize), col: index % gridSize};
    }
}
