import {IGameState} from "./App";

export enum Player {
    PLAYER_ONE = 'player-one',
    PLAYER_TWO = 'player-two',
}

export interface ISquare {
    player?: Player,
    winningStreak?: boolean
}

export class Game {
    constructor(private _gameState: IGameState) {}
}
