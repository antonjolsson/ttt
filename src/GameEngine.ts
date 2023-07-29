export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    winningNextTurnRows: {
        o: string[],
        x: string[]
    },
    winningRowLength: number,
    gridSize: number,
    ai?: Player,
    winner?: Player,
    aiLevel: AILevel,
    draw: boolean
}

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
    inWinningNextTurnRow?: boolean
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
    const gridSize = oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[0]
    const board = initBoard(gridSize)
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        winningNextTurnRows: {
            x: [] as string[],
            o: [] as string[]
        },
        gridSize: gridSize,
        winningRowLength: oldGameState?.winningRowLength ?? 3,
        board: board,
        ai: oldGameState ? oldGameState.ai : undefined,
        aiLevel: oldGameState?.aiLevel ?? AILevel.HARD,
        draw: false
    };
}

export class GameEngine {
    private gridSizeToRecursionDepth = new Map<number, number>([
        [3, 6],
        [4, 4],
        [5, 4],
        [6, 4],
        [7, 4],
    ])
    static ALLOWED_GRID_SIZES = [3, 4, 5, 6, 7]

    static getMidSquare(gridSize: number): number {
        const index = Math.floor(gridSize / 2)
        return (gridSize + 1) * index;
    }

    private evaluateGameState(gameState: IGameState/*, checkNextTurnWins?: boolean*/): void {
        const gridSize = gameState.gridSize
        const currentPlayer = gameState.currentPlayer
        gameState.winningNextTurnRows[gameState.currentPlayer] = []

        const board = gameState.board
        board.forEach(sq => sq.inWinningNextTurnRow = sq.player === currentPlayer ? undefined : sq.inWinningNextTurnRow)

        function getWinSequence(row: number[], winningLength: number, allowedEmptySquares: number): number[] | null {
            for (let i = 0; i <= row.length - winningLength; i++) {
                let emptySquares = 0
                let j = i
                for (; j < i + winningLength; j++) {
                    const square = board[row[j]]
                    if (square.player === undefined) {
                        emptySquares++
                    } else if (square.player !== currentPlayer) {
                        break
                    }
                    if (emptySquares > allowedEmptySquares) {
                        break
                    }
                }
                if (j === i + winningLength) {
                    return row.slice(i, i + winningLength)
                }
            }
            return null
        }

        for (const checkNextTurnWins of [false, true]) {
            const winningLength = gameState.winningRowLength/* - (checkNextTurnWins ? 1 : 0)*/
            const allowedEmptySquares = checkNextTurnWins ? 1 : 0

            const indices = Array.from(Array(gridSize * gridSize).keys())

            // Check for winner horizontally
            for (let i = 0; i < gridSize * gridSize; i += gridSize) {
                // const row = board.slice(i, i + gridSize)
                const row = indices.slice(i, i + gridSize)
                const winSequence = getWinSequence(row, winningLength, allowedEmptySquares);
                if (winSequence) {
                    this.onWinningRow(currentPlayer, winSequence, gameState, checkNextTurnWins)
                    if (!checkNextTurnWins) {
                        return
                    }
                }
            }

            // Check vertically
            for (let column = 0; column < gridSize; column++) {
                // const row = board.filter((_, i) => i % gridSize === column)
                const row = indices.filter((_, i) => i % gridSize === column)
                const winSequence = getWinSequence(row, winningLength, allowedEmptySquares);
                if (winSequence) {
                    this.onWinningRow(currentPlayer, winSequence, gameState, checkNextTurnWins)
                    if (!checkNextTurnWins) {
                        return
                    }
                }
            }

            let seq: number[] = []
            let winSequence: number[] | null = null

            for (let row = 0; row <= gridSize - winningLength; row++) {
                for (let col = 0; col <= gridSize - winningLength; col++) {
                    // Check diagonally nw - se
                    let startIndex = row * gridSize + col
                    let offset = startIndex % (gridSize + 1)
                    // seq = board.filter((_, j) => j >= startIndex && j % (gridSize + 1) === offset)
                    seq = indices.filter((_, j) => j >= startIndex && j % (gridSize + 1) === offset)
                    winSequence = getWinSequence(seq, winningLength, allowedEmptySquares);
                    if (winSequence) {
                        this.onWinningRow(currentPlayer, winSequence, gameState, checkNextTurnWins)
                        if (!checkNextTurnWins) {
                            return
                        }
                    }

                    // Check diagonally ne - sw
                    const mirroredCol = gridSize - 1 - col
                    startIndex = row * gridSize + mirroredCol
                    offset = startIndex % (gridSize - 1)
                    seq = indices.filter((_, j) => j >= startIndex
                        && (j === startIndex || j % gridSize < mirroredCol)
                        && j % (gridSize - 1) === offset)
                    winSequence = getWinSequence(seq, winningLength, allowedEmptySquares);
                    if (winSequence) {
                        this.onWinningRow(currentPlayer, winSequence, gameState, checkNextTurnWins)
                        if (!checkNextTurnWins) {
                            return
                        }
                    }
                }
            }

            if (!checkNextTurnWins) {
                // No winner, check for draw
                const draw = board.every(square => square.player)
                if (draw) {
                    gameState.draw = true
                }
            }

        }
    }

    private onWinningRow(currentPlayer: Player, indexSequence: number[], gameState: IGameState, nextTurnWin: boolean): void {
        if (nextTurnWin) {
            const rowAsString = indexSequence.join('-')
            const rows = currentPlayer === Player.CROSS
                ? gameState.winningNextTurnRows.x
                : gameState.winningNextTurnRows.o
            if (!rows.includes(rowAsString)) {
                rows.push(rowAsString)
                gameState.board.filter((_, i) => indexSequence.includes(i)).forEach(sq => sq.inWinningNextTurnRow = true)
            }
            return
        }
        // gameState.winner = currentPlayer
        const squareSeq = gameState.board.filter((_, i) => indexSequence.includes(i))
        squareSeq.forEach(sq => sq.inWinningRow = true)
        gameState.winningRow = squareSeq
        gameState.winner = currentPlayer
    }

    update(gameState: IGameState): void {
        this.evaluateGameState(gameState)
        // this.checkForEndCondition(gameState, true)
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
        const board = gameState.board
        const gridSize = gameState.gridSize

        let allSquaresData = board.map((square, index) => {
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

        // If gridSize > 3, only use squares adjacent to occupied ones as candidates
        if (gameState.gridSize > 3) {
            const occupiedSquaresData = allSquaresData.filter(data => data.square.player)
            const adjacentSquaresData = squaresData.filter(freeSquareData => {
                const iF = freeSquareData.index
                // Check if this free square is adjacent to some occupied square
                return occupiedSquaresData.some(data => {
                    const iO = data.index
                    return (
                        // Row above
                        (iO >= iF - gridSize - 1 && iO <= iF - gridSize + 1)
                        // Same  row
                        || iO === iF - 1 || iO === iF + 1
                        // Row below
                        || (iO >= iF + gridSize - 1 && iO <= iF + gridSize + 1))
                })
            })
            squaresData = adjacentSquaresData.map(data => {
                data.hasAdjacentSymbol = true
                return data
            })
        }

        for (let i = 0; i < squaresData.length; i++){
            const square = squaresData[i];
            square.outcomes = this.getSquarePoints(square.index, square.outcomes,
                JSON.parse(JSON.stringify(gameState)), 1)
            if (square.outcomes.imminentWin) {
                break
            }
        }
        squaresData.sort((a, b) => b.outcomes.points - a.outcomes.points)
        console.log(squaresData)
        console.log(gameState)
        board[squaresData[0].index].player = gameState.currentPlayer
    }

    private getSquarePoints(index: number, outcomes: ISquareOutcomes, gameState: IGameState, depth: number): ISquareOutcomes {
        gameState.board[index].player = gameState.currentPlayer
        /*for (const checkNextTurnWins of [false, true]) {*/
            this.evaluateGameState(gameState/*, checkNextTurnWins*/)
            if (gameState.winner === gameState.ai) {
                outcomes.winPoints += 1 / (depth ** 2)
                if (depth === 1) {
                    outcomes.imminentWin = true
                    this.setSquareOutcomePoints(outcomes)
                    return outcomes
                }
                this.setSquareOutcomePoints(outcomes)
            } else if (gameState.winner) {
                outcomes.lossPoints += 1 / (depth ** 2)
                if (depth === 2) {
                    outcomes.imminentLoss = true
                    this.setSquareOutcomePoints(outcomes)
                    return outcomes
                }
                this.setSquareOutcomePoints(outcomes)
                //
            } else if (gameState.draw) {
                outcomes.drawPoints += 1 / (depth ** 2)
                this.setSquareOutcomePoints(outcomes)
                return outcomes
            }
        /*}*/
        gameState.winningNextTurnRows[gameState.currentPlayer].forEach(_ => {
            outcomes.winPoints += (gameState.winningRowLength - 1) / gameState.winningRowLength / (depth ** 3)
        })
        gameState.winningNextTurnRows[this.getNextPlayer(gameState.currentPlayer)].forEach(_ => {
            outcomes.lossPoints += (gameState.winningRowLength - 1) / gameState.winningRowLength / (depth ** 3)
        })

        if (depth >= this.gridSizeToRecursionDepth.get(gameState.gridSize)!) {
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

    private setSquareOutcomePoints(outcomes: ISquareOutcomes): void {
        if (outcomes.imminentWin) {
            outcomes.points = 1000
        } else if (outcomes.imminentLoss) {
            outcomes.points = -1000
        }
        const totalOutcomes = outcomes.winPoints + outcomes.drawPoints + outcomes.lossPoints
        outcomes.points += (outcomes.winPoints - outcomes.lossPoints) / totalOutcomes
    }

    private makeEasyAIMove(gameState: IGameState): IGameState {
        const freeSquares = gameState.board.filter(sq => !sq.player)
        const index = Math.floor(freeSquares.length * Math.random())
        freeSquares[index].player = gameState.currentPlayer
        return gameState
    }
}
