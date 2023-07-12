import React, {createContext, ReactElement, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {GameEngine, ISquare, Player} from "./GameEngine";

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    gridSize: number,
    winner?: Player
}

export const GameStateContext = createContext({
    gameState: getInitialGameState(),
    setGameState: (g: SetStateAction<IGameState>) => {}
})

function initBoard(gridSize: number): ISquare[] {
    const board: ISquare[] = []
    for (let i = 0; i < gridSize * gridSize; i++) {
        const square: ISquare = {player: undefined}
        board.push(square)
    }
    return board
}

function getInitialGameState(): IGameState {
    return {
        currentPlayer: Player.CROSS,
        winningRow: [] as ISquare[],
        gridSize: 3,
        board: initBoard(3)
    };
}

function App(): ReactElement {
    function getCurrentMessage(currentPlayer: Player): string {
        return currentPlayer === Player.CROSS ? 'Player one\'s turn...' : 'Player two\'s turn...';
    }

    const [gameState, setGameState] = useState(getInitialGameState())
    const [message, setMessage] = useState(getCurrentMessage(gameState.currentPlayer))
    const gameEngine = useRef(new GameEngine(gameState))

    useEffect(() => {
        const playerName = gameState.currentPlayer === Player.CROSS ? 'Player one' : 'Player two'
        if (!gameState.winner) {
            setMessage(`${playerName}'s turn...`)
        } else {
            setMessage(`${playerName} won!`)
        }
    }, [gameState.currentPlayer, gameState.winner])

  return (
      <GameStateContext.Provider value={{gameState: gameState, setGameState: setGameState}}>
    <div className="app">
        <Header/>
        <main>
            <Board gameEngine={gameEngine.current}/>
            <MessageArea message={message}/>
        </main>

    </div>
      </GameStateContext.Provider>
  );
}

export default App;
