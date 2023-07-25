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
    winPoints: number,
    drawPoints: number,
    lossPoints: number,
    imminentWin: boolean,
    imminentLoss: boolean,
    points: number
}

export enum GameOutcome {
    WIN = 'win',
    DRAW = 'draw',
    LOSS = 'loss'
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
    const board = initBoard(oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[0])
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        gridSize: oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[0],
        winningRowLength: oldGameState?.winningRowLength ?? 3,
        board: board,
        ai: oldGameState ? oldGameState.ai : Player.CIRCLE,
        aiLevel: oldGameState?.aiLevel ?? AILevel.HARD,
        draw: false
    };
}

export class GameEngine {
    private aiLevelToRecursionDepth = new Map<AILevel, number>([
        [AILevel.HARD, 6]
    ])
    static ALLOWED_GRID_SIZES = [3, 4, 5, 6, 7]

    private checkForEndCondition(gameState: IGameState): IGameState {
        const board = gameState.board
        const gridSize = gameState.gridSize
        const currentPlayer = gameState.currentPlayer
        const winningLength = gameState.winningRowLength

        function getWinSequence(row: ISquare[]): ISquare[] | null {
            for (let i = 0; i <= gridSize - winningLength; i++) {
                const sequence = row.slice(i, i + winningLength)
                if (sequence.every(square => square.player === currentPlayer)) {
                    return sequence
                }
            }
            return null
        }

        // Check for winner horizontally
        for (let i = 0; i < gridSize * gridSize; i += gridSize) {
            const row = board.slice(i, i + gridSize)
            const winSequence = getWinSequence(row);
            if (winSequence) {
                return this.onWinningRow(currentPlayer, winSequence, gameState)
            }
        }

        // Check vertically
        for (let column = 0; column < gridSize; column++) {
            const row = board.filter((_, i) => i % gridSize === column)
            const winSequence = getWinSequence(row);
            if (winSequence) {
                return this.onWinningRow(currentPlayer, winSequence, gameState)
            }
        }

        // Check diagonally nw - sw
        let row = board.filter((_, j) => j % (gridSize + 1) === 0)
        let winSequence = getWinSequence(row);
        if (winSequence) {
            return this.onWinningRow(currentPlayer, winSequence, gameState)
        }

        // Check diagonally sw - ne
        row = board.filter((_, j) => j !== 0 && j < gridSize * gridSize - 1 && j % (gridSize - 1) === 0)
        winSequence = getWinSequence(row);
        if (winSequence) {
            return this.onWinningRow(currentPlayer, winSequence, gameState)
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
        return {...gameState, winner: currentPlayer, winningRow: row}
    }

    update(gameState: IGameState): void {
        this.checkForEndCondition(gameState)
        if (!gameState.winner && !gameState.draw) {
            gameState.currentPlayer = this.getNextPlayer(gameState.currentPlayer)

            if (gameState.currentPlayer === gameState.ai) {
                if (gameState.aiLevel === AILevel.EASY) {
                    this.makeEasyAIMove(gameState)
                } else {
                    this.makeHardAIMove(gameState)
                }
                this.update(gameState)
            }
        }
    }

    getNextPlayer(currentPlayer: Player): Player {
        return currentPlayer === Player.CROSS ? Player.CIRCLE : Player.CROSS;
    }

    private makeHardAIMove(gameState: IGameState): void {
        let squaresData = gameState.board.map((square, index) => {
            return {
                square: square,
                index: index,
                outcomes: {
                    winPoints: 0,
                    drawPoints: 0,
                    lossPoints: 0,
                    points: 0,
                    imminentWin: false,
                    imminentLoss: false
                }
            }
        })
        squaresData = squaresData.filter(data => !data.square.player)
        for (let i = 0; i < squaresData.length; i++){
            const square = squaresData[i];
            square.outcomes = this.getSquarePoints(square.index, square.outcomes,
                JSON.parse(JSON.stringify(gameState)), 1)
            if (square.outcomes.imminentWin) {
                break
            }
        }
        squaresData.sort((a, b) => b.outcomes.points - a.outcomes.points)
        gameState.board[squaresData[0].index].player = gameState.currentPlayer
    }

    private getSquarePoints(index: number, outcomes: ISquareOutcomes, gameState: IGameState, depth: number): ISquareOutcomes {
        gameState.board[index].player = gameState.currentPlayer
        gameState = this.checkForEndCondition(gameState)
        if (gameState.winner === gameState.ai) {
            outcomes.winPoints += this.getBaseOutcomePoints(depth, GameOutcome.WIN)
            if (depth === 1) {
                outcomes.imminentWin = true
            }
            this.setSquareOutcomePoints(outcomes)
            return outcomes
        } else if (gameState.winner) {
            outcomes.lossPoints += this.getBaseOutcomePoints(depth, GameOutcome.LOSS)
            if (depth === 2) {
                outcomes.imminentLoss = true
            }
            this.setSquareOutcomePoints(outcomes)
            return outcomes
        } else if (gameState.draw) {
            outcomes.drawPoints += this.getBaseOutcomePoints(depth, GameOutcome.DRAW)
            this.setSquareOutcomePoints(outcomes)
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
            return this.getSquarePoints(data.index, outcomes, JSON.parse(JSON.stringify(gameState)), depth + 1)
        })
            .sort((a, b) => b.points - a.points)[0]
    }

    private getBaseOutcomePoints(recursionDepth: number, outcome: GameOutcome): number {
        return 1 / (recursionDepth ** 3);
    }

    private setSquareOutcomePoints(outcomes: ISquareOutcomes): void {
        if (outcomes.imminentWin) {
            outcomes.points = Infinity
        } else if (outcomes.imminentLoss) {
            outcomes.points = -Infinity
        } else {
            const totalOutcomes = outcomes.winPoints + outcomes.drawPoints + outcomes.lossPoints
            outcomes.points = (outcomes.winPoints - outcomes.lossPoints) / totalOutcomes
        }
    }

    private makeEasyAIMove(gameState: IGameState): IGameState {
        const freeSquares = gameState.board.filter(sq => !sq.player)
        const index = Math.floor(freeSquares.length * Math.random())
        freeSquares[index].player = gameState.currentPlayer
        return gameState
    }
}
