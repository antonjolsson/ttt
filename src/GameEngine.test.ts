import {AILevel, GameEngine, getInitialGameState, Player} from "./GameEngine";

let gameState = getInitialGameState()
let engine = new GameEngine()

test('weighs outcomes by recursion depth', () => {
    gameState.ai = Player.CIRCLE
    gameState.currentPlayer = Player.CROSS // Will change to AI's turn when calling update

    gameState.board = [{}, {}, {player: Player.CIRCLE}, {}, {player: Player.CROSS}, {player: Player.CROSS},
        {player: Player.CROSS}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

test('avoids trivial loss', () => {
    gameState.ai = Player.CIRCLE
    gameState.currentPlayer = Player.CROSS // Will change to AI's turn when calling update

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE}]

    engine.update(gameState)
    console.log(gameState)

    expect(gameState.board[1].player).toBe(Player.CIRCLE)
})

