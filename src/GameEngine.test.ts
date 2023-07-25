import {GameEngine, getInitialGameState, Player} from "./GameEngine";

let gameState = getInitialGameState()
let engine = new GameEngine()

function initTest(ai: Player, currentPlayer: Player, gridSize = 3): void {
    gameState = getInitialGameState(gameState)
    gameState.ai = ai
    gameState.currentPlayer = engine.getNextPlayer(currentPlayer) // Will change to next player's turn when calling update
    gameState.gridSize = gridSize
}

test('board size 3: always start in center square', () => {
    initTest(Player.CROSS, Player.CROSS);

    engine.update(gameState)
    expect(gameState.board[4].player).toBe(Player.CROSS)
})

test('board size 3: weighs outcomes by recursion depth', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [{}, {}, {player: Player.CIRCLE}, {}, {player: Player.CROSS}, {player: Player.CROSS},
        {player: Player.CROSS}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

test('board size 3: always wins when starting and opponent doesn\'t choose corner', () => {
    initTest(Player.CROSS, Player.CROSS);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {},
        {}, {player: Player.CIRCLE}, {}]

    engine.update(gameState)
    expect(gameState.board[6].player).toBe(Player.CROSS)

    gameState.board[2].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.board[0].player).toBe(Player.CROSS)

    gameState.board[8].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.winner).toBe(Player.CROSS)
})

test('board size 3: avoids trivial loss #1', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[1].player).toBe(Player.CIRCLE)
})

test('board size 3: avoids trivial loss #2', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {player: Player.CROSS},
        {}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)
    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

/*test('board size 4: ai response time < 500 ms', () => {
    initTest(Player.CROSS, Player.CROSS, 4);

    const startTime = Date.now()
    engine.update(gameState)
    const timeTaken = Date.now() - startTime

    expect(timeTaken).toBeLessThanOrEqual(500)
})*/

