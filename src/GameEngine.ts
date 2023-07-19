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

export interface ISquareOutcomes {
    wins: number,
    draws: number,
    losses: number
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
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        gridSize: 3,
        board: initBoard(3),
        ai: oldGameState ? oldGameState.ai : Player.CIRCLE,
        aiLevel: oldGameState?.aiLevel ?? AILevel.HARD,
        draw: false
    };
}

export class GameEngine {
    private aiLevelToRecursionDepth = new Map<AILevel, number>([
        [AILevel.HARD, 10]
    ])

    constructor(private _gameState: IGameState) {}

    set gameState(value: IGameState) {
        this._gameState = value;
    }

    private checkForEndCondition(gameState: IGameState): IGameState {
        const board = gameState.board
        const gridSize = gameState.gridSize
        const currentPlayer = gameState.currentPlayer

        // Check for winner horizontally
        for (let i = 0; i < gridSize * gridSize; i += gridSize) {
            const row = board.slice(i, i + gridSize)
            if (row.every(square => square.player === currentPlayer)) {
                return this.onWinningRow(currentPlayer, row, gameState);
            }
        }

        // Check vertically
        for (let i = 0; i < gridSize; i++) {
            const row = board.filter((_, j) => j % gridSize === i)
            if (row.every(square => square.player === currentPlayer)) {
                return this.onWinningRow(currentPlayer, row, gameState)
            }
        }

        // Check diagonally
        let row = board.filter((_, j) => j % 4 === 0)
        if (row.every(square => square.player === currentPlayer)) {
            return this.onWinningRow(currentPlayer, row, gameState);
        }
        row = board.filter((_, j) => j !== 0 && j < gridSize * gridSize - 1 && j % (gridSize - 1) === 0)
        if (row.every(square => square.player === currentPlayer)) {
            return this.onWinningRow(currentPlayer, row, gameState);
        }

        // No winner, check for draw
        const draw = board.every(square => square.player)
        if (draw) {
            gameState.draw = true
        }

        return gameState
    }

    private onWinningRow(currentPlayer: Player, row: ISquare[], gameState: IGameState): IGameState {
        gameState.winner = currentPlayer
        row.forEach(square => square.inWinningRow = true)
        return {...this._gameState, winner: currentPlayer, winningRow: row}
    }

    update(gameState: IGameState): IGameState {
        this._gameState = gameState
        this._gameState = this.checkForEndCondition(this._gameState)
        if (!this._gameState.winner && !this._gameState.draw) {
            this._gameState.currentPlayer = this.getNextPlayer(this._gameState.currentPlayer)

            if (this._gameState.currentPlayer === this._gameState.ai) {
                if (this._gameState.aiLevel === AILevel.EASY) {
                    this.makeEasyAIMove()
                } else {
                    this.makeHardAIMove()
                }
                this.update(this._gameState)
            }
        }
        return this._gameState
    }

    getNextPlayer(currentPlayer: Player): Player {
        return currentPlayer === Player.CROSS ? Player.CIRCLE : Player.CROSS;
    }

    private makeHardAIMove(): void {
        let squaresData = this._gameState.board.map((square, index) => {
            return {
                square: square,
                index: index,
                outcomes: {
                    wins: 0,
                    draws: 0,
                    losses: 0
                }
            }
        })
        squaresData = squaresData.filter(data => !data.square.player)
        squaresData.forEach(square => {
            square.outcomes = this.getSquarePoints(square.index, square.outcomes,
                JSON.parse(JSON.stringify(this._gameState)), 0)
        })
        squaresData.sort((a, b) => this.getSquareOutcomePoints(b.outcomes) - this.getSquareOutcomePoints(a.outcomes))
        console.log(squaresData)
        this._gameState.board[squaresData[0].index].player = this._gameState.currentPlayer
    }

    private getSquareOutcomePoints(outcomes: ISquareOutcomes): number {
        const totalOutcomes = outcomes.wins + outcomes.draws + outcomes.losses
        return (outcomes.wins - outcomes.losses) / totalOutcomes
    }

    private getSquarePoints(index: number, outcomes: ISquareOutcomes, gameState: IGameState, depth: number): ISquareOutcomes {
        gameState.board[index].player = gameState.currentPlayer
        gameState = this.checkForEndCondition(gameState)
        if (gameState.winner === gameState.ai) {
            outcomes.wins++
            return outcomes
        } else if (gameState.winner) {
            outcomes.losses++
            return outcomes
        } else if (gameState.draw) {
            outcomes.draws++
            return outcomes
        }

        if (depth >= this.aiLevelToRecursionDepth.get(AILevel.HARD)!) {
            return outcomes
        }

        // Switch to other player
        gameState.currentPlayer = this.getNextPlayer(gameState.currentPlayer)
        const freeSquares = gameState.board.map((sq, i) => {
                return {square: sq, index: i}
            }
        )
            .filter(data => !data.square.player)
        return freeSquares.map(data => {
            return this.getSquarePoints(data.index, outcomes, JSON.parse(JSON.stringify(gameState)), ++depth)
        })
            .sort((a, b) => this.getSquareOutcomePoints(b) - this.getSquareOutcomePoints(a))[0]
    }

    private makeEasyAIMove(): void {
        const freeSquares = this._gameState.board.filter(sq => !sq.player)
        const index = Math.floor(freeSquares.length * Math.random())
        freeSquares[index].player = this._gameState.currentPlayer
    }
}
