import {GameEngine, getInitialGameState, Player} from "./GameEngine";

let gameState = getInitialGameState()
let engine = new GameEngine(gameState.aiLevel)

function initTest(ai: Player, currentPlayer: Player, gridSize = 3, winLength = 3): void {
    gameState.gridSize = gridSize
    gameState.aiPlayer = ai
    gameState.winningRowLength = winLength
    gameState = getInitialGameState(gameState)

    gameState.currentPlayer = GameEngine.getNextPlayer(currentPlayer) // Will change to next player's turn when calling update
}

test('bs 3, wl 3: recognizes win condition', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {player: Player.CROSS}, {}, {player: Player.CIRCLE},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE},
        {}, {}, {player: Player.CROSS}]

    engine.update(gameState)

    expect(gameState.winner).toBe(Player.CROSS)
})

test('bs 3, wl 3: picks winning square', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {player: Player.CROSS}, {}, {},
        {player: Player.CROSS}, {player: Player.CIRCLE}, {player: Player.CIRCLE},
        {player: Player.CIRCLE}, {player: Player.CROSS}, {player: Player.CROSS}]

    engine.update(gameState)

    expect(gameState.winner).toBe(Player.CIRCLE)
})

test('bs 3, wl 3: avoids loss I', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [
        {player: Player.CROSS}, {player: Player.CIRCLE}, {},
        {player: Player.CROSS}, {player: Player.CROSS}, {},
        {player: Player.CIRCLE}, {player: Player.CROSS}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.winner).toBe(undefined)
})

test('bs 3, wl 3: avoids loss III', () => {
    initTest(Player.CROSS, Player.CROSS);

    gameState.board = [
        {player: Player.CROSS}, {player: Player.CIRCLE}, {player: Player.CROSS},
        {player: Player.CROSS}, {player: Player.CIRCLE}, {},
        {player: Player.CIRCLE}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[7].player).toBe(Player.CROSS)
})

test('bs 3, wl 3: avoids loss II', () => {
    initTest(Player.CROSS, Player.CROSS);

    gameState.board = [
        {player: Player.CROSS}, {player: Player.CROSS}, {player: Player.CIRCLE},
        {}, {player: Player.CIRCLE}, {},
        {}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[6].player).toBe(Player.CROSS)
})

test('bs 4, wl 3: creates semi-win condition', () => {
    initTest(Player.CROSS, Player.CROSS, 4);

    gameState.board = [
        {}, {}, {}, {},
        {}, {}, {}, {},
        {}, {}, {player: Player.CROSS}, {},
        {player: Player.CIRCLE}, {}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[5].player).toBe(Player.CROSS)
})

test('bs 3-4: always start in center square when cross', () => {
    for (let i = 3; i <= 4; i++) {
        initTest(Player.CROSS, Player.CROSS, i);

        engine.update(gameState)

        const midSquare = GameEngine.getMidSquare(i)
        expect(gameState.board[midSquare].player).toBe(Player.CROSS)
    }
})

/*test('bs 4: always start in center squares when circle and cross in center squares', () => {
    for (let i = 4; i <= 5; i++) {
        initTest(Player.CIRCLE, Player.CIRCLE, i);

        const midSquare = GameEngine.getMidSquare(i)
        const midSquareUpperLeft = midSquare - gameState.gridSize - 1
        gameState.board[midSquareUpperLeft].player = Player.CROSS

        engine.update(gameState)

        expect(gameState.board[midSquare].player).toBe(Player.CIRCLE)
    }
})*/

/*test('bs 3: weighs outcomes by recursion depth', () => {
    initTest(Player.CIRCLE, Player.CIRCLE);

    gameState.board = [{}, {}, {player: Player.CIRCLE}, {}, {player: Player.CROSS}, {player: Player.CROSS},
        {player: Player.CROSS}, {}, {player: Player.CIRCLE}]

    engine.update(gameState)

    expect(gameState.board[3].player).toBe(Player.CIRCLE)
})*/

test('bs 3: always wins when starting and opponent doesn\'t choose corner', () => {
    initTest(Player.CROSS, Player.CROSS);

    gameState.board = [
        {}, {}, {},
        {}, {player: Player.CROSS}, {},
        {}, {player: Player.CIRCLE}, {}]

    engine.update(gameState)
    expect(gameState.board[0].player).toBe(Player.CROSS)

    gameState.board[8].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.board[6].player).toBe(Player.CROSS)

    gameState.board[2].player = Player.CIRCLE
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

/*test('bs 4-5, wl 3: ai response time < 1700 ms', () => {
    for (let i = 4; i <= 5; i++) {
        initTest(Player.CIRCLE, Player.CIRCLE, i);
        gameState.board[GameEngine.getMidSquare(i)].player = Player.CROSS

        const startTime = Date.now()
        engine.update(gameState)
        const timeTaken = Date.now() - startTime
        expect(timeTaken).toBeLessThanOrEqual(1700)
    }
})*/

/*test('bs 4, wl 3: ai always wins when starting', () => {
    initTest(Player.CROSS, Player.CROSS, 4)

    engine.update(gameState)
    expect(gameState.board[10].player).toBe(Player.CROSS)

    gameState.board[5].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.board[6].player).toBe(Player.CROSS)

    gameState.board[2].player = Player.CIRCLE
    engine.update(gameState)
    expect(gameState.winner).toBe(Player.CROSS)
})*/

/*test('bs 4, wl 3: makes human-like try to avoid inevitable loss', () => {
    initTest(Player.CIRCLE, Player.CIRCLE, 4);
    const midSquare = GameEngine.getMidSquare(4)
    gameState.board[midSquare].player = Player.CROSS
    gameState.board[midSquare - 1].player = Player.CROSS
    gameState.board[midSquare - gameState.gridSize - 1].player = Player.CIRCLE

    engine.update(gameState)

    expect(gameState.board[midSquare - 2].player || gameState.board[midSquare + 1].player).toBe(Player.CIRCLE)
})*/

/*test('bs 4, wl 3: plays optimally when human does and human starts in corner', () => {
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
})*/

/*test('bs 5, wl 4: avoids trivial loss', () => {
    initTest(Player.CIRCLE, Player.CIRCLE, 5, 4);
    const midSquare = GameEngine.getMidSquare(5)
    gameState.board[midSquare].player = Player.CROSS
    gameState.board[midSquare - gameState.gridSize].player = Player.CIRCLE
    gameState.board[midSquare - gameState.gridSize +  1].player = Player.CROSS

    engine.update(gameState)

    expect(gameState.board[midSquare + gameState.gridSize - 1].player).toBe(Player.CIRCLE)
})*/

/*test('bs 5, wl 4: optimal second move when cross and circle played non-optimally', () => {
    initTest(Player.CROSS, Player.CROSS, 5, 4);
    gameState.board = [
        {}, {}, {}, {}, {},
        {}, {}, {}, {}, {},
        {}, {}, {player: Player.CROSS}, {}, {},
        {}, {}, {player: Player.CIRCLE}, {}, {},
        {}, {}, {}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[18].player).toBe(Player.CROSS)
})*/

/*test('bs 5, wl 4: optimal first move when circle and cross in mid square', () => {
    initTest(Player.CROSS, Player.CROSS, 5, 4);
    gameState.board = [
        {}, {}, {}, {}, {},
        {}, {}, {}, {}, {},
        {}, {}, {player: Player.CROSS}, {}, {},
        {}, {}, {}, {}, {},
        {}, {}, {}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[6].player).toBe(Player.CROSS)
})*/

/*test('bs 5, wl 4: detects future semi-win', () => {
    initTest(Player.CROSS, Player.CROSS, 5, 4);
    gameState.board = [
        {}, {}, {}, {}, {},
        {}, {}, {player: Player.CROSS}, {player: Player.CIRCLE}, {},
        {}, {}, {player: Player.CROSS}, {}, {},
        {}, {player: Player.CROSS}, {player: Player.CIRCLE}, {player: Player.CIRCLE}, {},
        {}, {}, {}, {}, {}]

    engine.update(gameState)

    expect(gameState.board[11].player).toBe(Player.CROSS)
    // expect(gameState.semiWinner).toBe(Player.CROSS)
})*/

