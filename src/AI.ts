import {GameEngine, IGameState, Player} from "./GameEngine";
import assert from "assert";

enum AIStrategy {
    MAXIMIZING = 'maximizing', MINIMIZING = 'minimizing'
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

    constructor(private checkForEndCondition: (gameState: IGameState) => IGameState) {}

    move(gameState: IGameState): void {
        // If empty board, hard-code AI to choose center square
        if (gameState.board.every(sq => !sq.player)) {
            const midSquare = GameEngine.getMidSquare(gameState.gridSize)
            gameState.board[midSquare].player = gameState.aiPlayer
            return
        }

        const strategy = gameState.aiPlayer === Player.CROSS ? AIStrategy.MAXIMIZING : AIStrategy.MINIMIZING

        let bestSquare = -1
        let bestSquarePoints = strategy === AIStrategy.MAXIMIZING ? -Infinity : Infinity

        gameState.board.forEach((sq, i) => {
            if (sq.player) {
                return
            }
            const newState = JSON.parse(JSON.stringify(gameState))
            newState.board[i].player = gameState.aiPlayer
            const opponentStrategy = strategy === AIStrategy.MAXIMIZING ? AIStrategy.MINIMIZING : AIStrategy.MAXIMIZING
            const points = this.miniMax(newState, 0, opponentStrategy)
            if ((strategy === AIStrategy.MAXIMIZING && points > bestSquarePoints)
                || (strategy === AIStrategy.MINIMIZING && points < bestSquarePoints)) {
                bestSquarePoints = points
                bestSquare = i
            }
        })

        gameState.board[bestSquare].player = gameState.aiPlayer
    }

    miniMax(gameState: IGameState, depth: number, strategy: AIStrategy): number {
        gameState = this.checkForEndCondition(gameState)
        if (gameState.draw) {
            return 0
        }
        if (gameState.winner === Player.CROSS) {
            return HardAI.WIN_POINTS - depth * HardAI.DEPTH_POINTS
        }
        if (gameState.winner === Player.CIRCLE) {
            return -HardAI.WIN_POINTS + depth * HardAI.DEPTH_POINTS
        }

        if (strategy === AIStrategy.MAXIMIZING) {
            let bestVal = -Infinity
            gameState.board.forEach((sq, i) => {
                if (sq.player) {
                    return
                }
                const newState = JSON.parse(JSON.stringify(gameState)) as IGameState
                newState.board[i].player = Player.CROSS
                newState.currentPlayer = Player.CROSS
                const value = this.miniMax(newState, depth + 1, AIStrategy.MINIMIZING)
                bestVal = Math.max(bestVal, value)
            })
            return bestVal
        }

        // strategy = AIStrategy.MINIMIZING
        let bestVal = Infinity
        gameState.board.forEach((sq, i) => {
            if (sq.player) {
                return
            }
            const newState = JSON.parse(JSON.stringify(gameState)) as IGameState
            newState.board[i].player = Player.CIRCLE
            newState.currentPlayer = Player.CIRCLE
            const value = this.miniMax(newState, depth + 1, AIStrategy.MAXIMIZING)
            bestVal = Math.min(bestVal, value)
        })
        return bestVal
    }

    /*private gridSizeToRecursionDepth = new Map<number, number>([
        [3, 6],
        [4, 4],
        [5, 3],
        [6, 3],
        [7, 3],
    ])*/

    /*move(gameState: IGameState): void {
        // If gridSize > 3, only use squares adjacent to occupied ones as candidates
        if (gridSize > 3) {
            const occupiedSquaresData = allSquaresData.filter(data => data.square.player)
            const adjacentSquaresData = squaresData.filter(freeSquareData => {
                const iF = freeSquareData.index
                const {row: fRow, col: fCol} = this.getRowAndColumnFromIndex(iF, gridSize);

                // Check if this free square is adjacent to some occupied square
                return occupiedSquaresData.some(data => {
                    const iO = data.index
                    const {row: oRow, col: oCol} = this.getRowAndColumnFromIndex(iO, gridSize);

                    return (Math.abs(oRow - fRow) <= 1
                        && Math.abs(oCol - fCol) <= 1)
                })
            })
            squaresData = adjacentSquaresData.map(data => {
                data.hasAdjacentSymbol = true
                return data
            })
        }
    }*/

    private getRowAndColumnFromIndex(index: number, gridSize: number): { row: number, col: number } {
        return {row: Math.floor(index / gridSize), col: index % gridSize};
    }
}
