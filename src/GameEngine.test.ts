import {AILevel, GameEngine, getInitialGameState, Player} from "./GameEngine";

let gameState = getInitialGameState()
let engine = new GameEngine(gameState)

test('weighs outcomes by recursion depth', () => {
    gameState.ai = Player.CIRCLE
    gameState.aiLevel = AILevel.HARD
    gameState.gridSize = 3
    gameState.winningRowLength = 3

    gameState.board = [{}, {}, {player: Player.CIRCLE}, {}, {player: Player.CROSS}, {player: Player.CROSS},
        {player: Player.CROSS}, {}, {player: Player.CIRCLE}]
    gameState.currentPlayer = Player.CROSS // Will change to  AI's turn when calling update
    gameState = engine.update(gameState)

    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})
