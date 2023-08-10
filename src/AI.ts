import {GameEngine, GameResult, IGameOutcome, IGameState, ISquareEvaluation} from "./GameEngine";

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

export class HardAI implements IAI {
    constructor(private checkForEndCondition: (gameState: IGameState, checkSemiWins?: boolean) => IGameState) {}

    private static SEMI_WIN_POINTS = 0.5
    private static IMMINENT_WIN_POINTS = 1000
    private gridSizeToRecursionDepth = new Map<number, number>([
        [3, 6],
        [4, 4],
        [5, 3],
        [6, 3],
        [7, 3],
    ])

    move(gameState: IGameState): void {
        const board = gameState.board
        const gridSize = gameState.gridSize

        let allSquaresData = board.map((square, index) => {
            return {
                square: square,
                index: index,
                outcomes: {
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    semiWins: 0,
                    semiLosses: 0,
                    outcomes: [] as IGameOutcome[],
                    winPoints: 0,
                    drawPoints: 0,
                    lossPoints: 0,
                    points: 0,
                    imminentWin: false,
                    imminentLoss: false
                },
                hasAdjacentSymbol: false
            }
        })
        let squaresData = allSquaresData.filter(data => !data.square.player)

        // If empty board, always go with center square
        if (squaresData.length === board.length) {
            const midSquare = GameEngine.getMidSquare(gridSize);
            board[midSquare].player = gameState.currentPlayer
            return
        }

        // If first move and circle, always go with center square if free, else square to its upper left
        if (gridSize > 4 && squaresData.length === board.length - 1) {
            const midSquare = GameEngine.getMidSquare(gridSize);
            if (board[midSquare].player) {
                board[midSquare - gridSize - 1].player = gameState.currentPlayer
            } else {
                board[midSquare].player = gameState.currentPlayer
            }
            return
        }

        // If second move, cross and circle picked square straight up, left, right or down from center,
        // pick square that's adjacent to both
        if (gridSize > 4 && squaresData.length === board.length - 2) {
            const midSquare = GameEngine.getMidSquare(gridSize);
            if (board[midSquare - gridSize].player === GameEngine.getNextPlayer(gameState.currentPlayer)
                || board[midSquare - 1].player === GameEngine.getNextPlayer(gameState.currentPlayer)) {
                board[midSquare - gridSize - 1].player = gameState.currentPlayer
                return
            } else if (board[midSquare + 1].player === GameEngine.getNextPlayer(gameState.currentPlayer)
                || board[midSquare + gridSize].player === GameEngine.getNextPlayer(gameState.currentPlayer)) {
                board[midSquare + gridSize + 1].player = gameState.currentPlayer
                return
            }
        }

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

        for (let i = 0; i < squaresData.length; i++) {
            const square = squaresData[i];
            square.outcomes = this.getSquarePoints(square.index, square.outcomes,
                JSON.parse(JSON.stringify(gameState)), 1)
            if (square.outcomes.imminentWin) {
                break
            }
        }

        squaresData.sort((a, b) => {
            let sorting = b.outcomes.points - a.outcomes.points
            // Possibly break sorting tie by determining square closest to centre
            if (sorting === 0) {
                const midSquare = GameEngine.getMidSquare(gridSize);
                const {row: midSquareRow, col: midSquareCol} = this.getRowAndColumnFromIndex(midSquare, gridSize)
                const {row: aRow, col: aCol} = this.getRowAndColumnFromIndex(a.index, gridSize)
                const {row: bRow, col: bCol} = this.getRowAndColumnFromIndex(b.index, gridSize)
                const aDist = Math.abs(aRow - midSquareRow) + Math.abs(aCol - midSquareCol)
                const bDist = Math.abs(bRow - midSquareRow) + Math.abs(bCol - midSquareCol)
                sorting = aDist - bDist
            }
            return sorting
        })
        console.log(squaresData)
        board[squaresData[0].index].player = gameState.currentPlayer
    }

    private getSquarePoints(index: number, evaluation: ISquareEvaluation, gameState: IGameState, depth: number): ISquareEvaluation {
        gameState.board[index].player = gameState.currentPlayer
        gameState = this.checkForEndCondition(gameState, true)
        if (gameState.winner === gameState.aiSign) {
            evaluation.winPoints += this.getBaseOutcomePoints(depth)
            evaluation.wins++
            evaluation.outcomes.push({outcome: GameResult.WIN, depth: depth, board: [...gameState.board]})
            if (depth === 1) {
                evaluation.imminentWin = true
            }
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        }
        if (gameState.winner) {
            evaluation.lossPoints += this.getBaseOutcomePoints(depth)
            evaluation.losses++
            evaluation.outcomes.push({outcome: GameResult.LOSS, depth: depth, board: [...gameState.board]})
            if (depth === 2) {
                evaluation.imminentLoss = true
            }
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        }
        if (gameState.draw) {
            evaluation.drawPoints += this.getBaseOutcomePoints(depth)
            evaluation.draws++
            evaluation.outcomes.push({outcome: GameResult.DRAW, depth: depth, board: [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        }
        if (gameState.semiWinner === gameState.aiSign) {
            evaluation.winPoints += this.getBaseOutcomePoints(depth) * HardAI.SEMI_WIN_POINTS
            evaluation.semiWins++
            evaluation.outcomes.push({outcome: GameResult.SEMI_WIN, depth: depth, board: [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
        } else if (gameState.semiWinner) {
            evaluation.lossPoints += this.getBaseOutcomePoints(depth) * HardAI.SEMI_WIN_POINTS
            evaluation.semiLosses++
            evaluation.outcomes.push({outcome: GameResult.SEMI_LOSS, depth: depth, board: [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
        }

        if (depth >= this.gridSizeToRecursionDepth.get(gameState.gridSize)!) {
            return evaluation
        }

        // Switch to other player
        gameState.currentPlayer = GameEngine.getNextPlayer(gameState.currentPlayer)
        const freeSquares = gameState.board.map((sq, i) => {
                return {square: sq, index: i}
            }
        )
            .filter(data => !data.square.player)
        return freeSquares.map(data => {
            return this.getSquarePoints(data.index, evaluation, JSON.parse(JSON.stringify(gameState)), depth + 1)
        })
            .sort((a, b) => b.points - a.points)[0]
    }

    private getRowAndColumnFromIndex(index: number, gridSize: number): { row: number, col: number } {
        return {row: Math.floor(index / gridSize), col: index % gridSize};
    }

    private getBaseOutcomePoints(recursionDepth: number): number {
        return 1 / (recursionDepth ** 2);
    }

    private setSquareOutcomePoints(evaluation: ISquareEvaluation): void {
        if (evaluation.imminentWin) {
            evaluation.points += HardAI.IMMINENT_WIN_POINTS
        } else if (evaluation.imminentLoss) {
            evaluation.points -= HardAI.IMMINENT_WIN_POINTS
        } else {
            const totalOutcomes = evaluation.winPoints + evaluation.drawPoints + evaluation.lossPoints
            evaluation.points = (evaluation.winPoints - evaluation.lossPoints) / totalOutcomes
        }
    }
}
