import {GameEngine, getInitialGameState, Player} from "./GameEngine";

let gameState = getInitialGameState()
let engine = new GameEngine()

function initTest(ai: Player, currentPlayer: Player, gridSize = 3): void {
    gameState.gridSize = gridSize
    gameState.ai = ai
    gameState = getInitialGameState(gameState)

    gameState.currentPlayer = engine.getNextPlayer(currentPlayer) // Will change to next player's turn when calling update
}

test('board size 3, winning length 3: recognizes win condition', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {player: Player.CROSS}, {}, {player: Player.CIRCLE},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE},
        {}, {}, {player: Player.CROSS}]

    engine.update(gameState)

    expect(gameState.winner).toBe(Player.CROSS)
})

test('bs 3-7: always start in center square when cross', () => {
    for (let i = 3; i <= 7; i++) {
        initTest(Player.CROSS, Player.CROSS, i);

        engine.update(gameState)

        const midSquare = GameEngine.getMidSquare(i)
        expect(gameState.board[midSquare].player).toBe(Player.CROSS)
    }
})

test('bs 4: always start in center squares when circle and cross in center squares', () => {
    for (let i = 4; i <= 4; i += 2) {
        initTest(Player.CIRCLE, Player.CIRCLE, i);

        const midSquare = GameEngine.getMidSquare(i)
        const midSquareUpperLeft = midSquare - gameState.gridSize - 1
        gameState.board[midSquareUpperLeft].player = Player.CROSS

        engine.update(gameState)

        expect(gameState.board[midSquare].player).toBe(Player.CIRCLE)
    }
})

test('bs 3: weighs outcomes by recursion depth', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [{}, {}, {player: Player.CIRCLE}, {}, {player: Player.CROSS}, {player: Player.CROSS},
        {player: Player.CROSS}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

test('bs 3: always wins when starting and opponent doesn\'t choose corner', () => {
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

test('bs 3, wl 3: avoids trivial loss #1', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[1].player).toBe(Player.CIRCLE)
})

test('bs 3, wl 3: avoids trivial loss #2', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {player: Player.CROSS},
        {}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)
    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

test('bs 4, wl 3: ai response time < 500 ms', () => {
    for (let i = 4; i <= 5; i++) {
        initTest(Player.CIRCLE, Player.CIRCLE, i);
        gameState.board[GameEngine.getMidSquare(i)].player = Player.CROSS

        const startTime = Date.now()
        engine.update(gameState)
        const timeTaken = Date.now() - startTime
        expect(timeTaken).toBeLessThanOrEqual(500)
    }
})

test('bs 4, wl 3: ai always wins when starting', () => {
    initTest(Player.CROSS, Player.CROSS, 4)

    engine.update(gameState)
    expect(gameState.board[10].player).toBe(Player.CROSS)

    gameState.board[5].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.board[6].player).toBe(Player.CROSS)

    gameState.board[2].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.winner).toBe(Player.CROSS)
})

test('bs 4, wl 3: makes human-like try to avoid inevitable loss', () => {
    initTest(Player.CIRCLE, Player.CIRCLE, 4);
    const midSquare = GameEngine.getMidSquare(4)
    gameState.board[midSquare].player = Player.CROSS
    gameState.board[midSquare - 1].player = Player.CROSS
    gameState.board[midSquare - gameState.gridSize - 1].player = Player.CIRCLE

    engine.update(gameState)

    expect(gameState.board[midSquare - 2].player || gameState.board[midSquare + 1].player).toBe(Player.CIRCLE)
})

test('bs 4, wl 3: plays optimally when human does and human starts in corner', () => {
    initTest(Player.CIRCLE, Player.CIRCLE, 4);

    gameState.board[0].player = Player.CROSS
    engine.update(gameState)
    expect(gameState.board[5].player).toBe(Player.CIRCLE)

    gameState.board[4].player = Player.CROSS
    engine.update(gameState)
    expect(gameState.board[8].player).toBe(Player.CIRCLE)

    gameState.board[2].player = Player.CROSS
    engine.update(gameState)
    expect(gameState.board[1].player).toBe(Player.CIRCLE)

    gameState.board[9].player = Player.CROSS
    engine.update(gameState)
    expect(gameState.board[14].player).toBe(Player.CIRCLE)

    gameState.board[6].player = Player.CROSS
    engine.update(gameState)
    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})

