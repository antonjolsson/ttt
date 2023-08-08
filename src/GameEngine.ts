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

enum GameResult {
    WIN = 'win',
    DRAW = 'draw',
    LOSS = 'loss',
    SEMI_WIN = 'semi-win',
    SEMI_LOSS = 'semi-loss'
}

interface IGameOutcome {
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
    ai?: Player,
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
    /*semiWinPoints: number,*/
    drawPoints: number,
    lossPoints: number,
    /*semiLossPoints: number,*/
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
    const gridSize = oldGameState ? oldGameState.gridSize : GameEngine.ALLOWED_GRID_SIZES[2]
    const board = initBoard(gridSize)
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        semiWinningRow: [] as ISquare[],
        gridSize: gridSize,
        winningRowLength: oldGameState?.winningRowLength ?? GameEngine.ALLOWED_WIN_LENGTHS[1],
        board: board,
        ai: oldGameState ? oldGameState.ai : Player.CROSS,
        aiLevel: oldGameState?.aiLevel ?? AILevel.HARD,
        draw: false
    };
}

export class GameEngine {
    private static SEMI_WIN_POINTS = 0.5
    private static IMMINENT_WIN_POINTS = 1000
    private gridSizeToRecursionDepth = new Map<number, number>([
        [3, 6],
        [4, 4],
        [5, 3],
        [6, 3],
        [7, 3],
    ])
    static ALLOWED_GRID_SIZES = [3, 4, 5, 6, 7]
    static ALLOWED_WIN_LENGTHS = [3, 4]

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
        if (gridSize > 4 && squaresData.length === board.length - 1)  {
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
        if (gridSize > 4 && squaresData.length === board.length - 2)  {
            const midSquare = GameEngine.getMidSquare(gridSize);
            if (board[midSquare - gridSize].player === this.getNextPlayer(gameState.currentPlayer)
                || board[midSquare - 1].player === this.getNextPlayer(gameState.currentPlayer)) {
                board[midSquare - gridSize - 1].player = gameState.currentPlayer
                return
            } else if (board[midSquare + 1].player === this.getNextPlayer(gameState.currentPlayer)
                || board[midSquare + gridSize].player === this.getNextPlayer(gameState.currentPlayer)) {
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

        for (let i = 0; i < squaresData.length; i++){
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

    private getRowAndColumnFromIndex(index: number, gridSize: number): {row: number, col: number} {
        return {row: Math.floor(index / gridSize), col: index % gridSize};
    }

    private getSquarePoints(index: number, evaluation: ISquareEvaluation, gameState: IGameState, depth: number): ISquareEvaluation {
        gameState.board[index].player = gameState.currentPlayer
        gameState = this.checkForEndCondition(gameState, true)
        if (gameState.winner === gameState.ai) {
            evaluation.winPoints += this.getBaseOutcomePoints(depth)
            evaluation.wins++
            evaluation.outcomes.push({outcome: GameResult.WIN, depth: depth, board: [...gameState.board]})
            if (depth === 1) {
                evaluation.imminentWin = true
            }
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        } if (gameState.winner) {
            evaluation.lossPoints += this.getBaseOutcomePoints(depth)
            evaluation.losses++
            evaluation.outcomes.push({outcome: GameResult.LOSS, depth: depth, board: [...gameState.board]})
            if (depth === 2) {
                evaluation.imminentLoss = true
            }
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        } if (gameState.draw) {
            evaluation.drawPoints += this.getBaseOutcomePoints(depth)
            evaluation.draws++
            evaluation.outcomes.push({outcome: GameResult.DRAW, depth: depth, board: [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
            return evaluation
        } if (gameState.semiWinner === gameState.ai) {
            evaluation.winPoints += this.getBaseOutcomePoints(depth) * GameEngine.SEMI_WIN_POINTS
            evaluation.semiWins++
            evaluation.outcomes.push({outcome: GameResult.SEMI_WIN, depth: depth, board:  [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
        } else if (gameState.semiWinner) {
            evaluation.lossPoints += this.getBaseOutcomePoints(depth) * GameEngine.SEMI_WIN_POINTS
            evaluation.semiLosses++
            evaluation.outcomes.push({outcome: GameResult.SEMI_LOSS, depth: depth, board: [...gameState.board]})
            this.setSquareOutcomePoints(evaluation)
        }

        if (depth >= this.gridSizeToRecursionDepth.get(gameState.gridSize)!) {
            return evaluation
        }

        // Switch to other player
        gameState.currentPlayer = this.getNextPlayer(gameState.currentPlayer)
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

    private getBaseOutcomePoints(recursionDepth: number): number {
        return 1 / (recursionDepth ** 2);
    }

    private setSquareOutcomePoints(evaluation: ISquareEvaluation): void {
        if (evaluation.imminentWin) {
            evaluation.points += GameEngine.IMMINENT_WIN_POINTS
        } else if (evaluation.imminentLoss) {
            evaluation.points -= GameEngine.IMMINENT_WIN_POINTS
        } else {
            const totalOutcomes = evaluation.winPoints + evaluation.drawPoints + evaluation.lossPoints
            evaluation.points = (evaluation.winPoints - evaluation.lossPoints) / totalOutcomes
        }
    }

    private makeEasyAIMove(gameState: IGameState): IGameState {
        const freeSquares = gameState.board.filter(sq => !sq.player)
        const index = Math.floor(freeSquares.length * Math.random())
        freeSquares[index].player = gameState.currentPlayer
        return gameState
    }
}
