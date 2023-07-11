import React, {createContext, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {Game, ISquare, Player} from "./Game";

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningStreak: ISquare[],
    gridSize: number,
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

function getInitialGameState() {
    return {
        currentPlayer: Player.CROSS,
        winningStreak: [] as ISquare[],
        gridSize: 3,
        board: initBoard(3)
    };
}

function App() {
    function getCurrentMessage(currentPlayer: Player) {
        return currentPlayer === Player.CROSS ? 'Player one\'s turn...' : 'Player two\'s turn...';
    }

    const [gameState, setGameState] = useState(getInitialGameState())
    const [message, setMessage] = useState(getCurrentMessage(gameState.currentPlayer))
    const game = useRef(new Game(gameState))

    useEffect(() => {
        setMessage(getCurrentMessage(gameState.currentPlayer))
    }, [gameState.currentPlayer])

  return (
      <GameStateContext.Provider value={{gameState: gameState, setGameState: setGameState}}>
    <div className="app">
        <Header/>
        <main>
            <Board game={game.current}/>
            <MessageArea message={message}/>
        </main>

    </div>
      </GameStateContext.Provider>
  );
}

export default App;
