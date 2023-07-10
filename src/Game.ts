export enum Player {
    PLAYER_ONE = 'player-one',
    PLAYER_TWO = 'player-two',
}

export interface ISquare {
    player?: Player,
    winningStreak?: boolean
}

export class Game {
    private _gridSize = 3
    private _board: ISquare[] = []
    private _players: Player[] = [Player.PLAYER_ONE, Player.PLAYER_TWO]
    private _currentPlayer = this._players[0]

    get gridSize(): number {
        return this._gridSize;
    }

    set gridSize(value: number) {
        this._gridSize = value;
    }

    get board(): ISquare[] {
        return this._board
    }

    get currentPlayer(): Player {
        return this._currentPlayer
    }

    constructor() {
        for (let i = 0; i < this._gridSize * this._gridSize; i++) {
            const square: ISquare = {player: undefined}
            this._board.push(square)
        }
    }

    setSquare(square: number) {
        this._board[square].player = this._currentPlayer
        this._currentPlayer = this._players[(this._players.findIndex(player => player === this._currentPlayer) + 1) % 2]
    }
}
