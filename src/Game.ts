import {IGameState} from "./App";

export enum Player {
    CROSS = 'x',
    CIRCLE = 'o',
}

export interface ISquare {
    player?: Player,
    winningStreak?: boolean
}

export class Game {
    constructor(private _gameState: IGameState) {}
}
