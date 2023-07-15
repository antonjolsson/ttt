import React, {createContext, ReactElement, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {GameEngine, getInitialGameState, ISquare, Player} from "./GameEngine";
import {RestartButton} from "./components/RestartButton";
import {Footer} from "./components/Footer";
import {SideBar} from "./components/SideBar";

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    gridSize: number,
    ai?: Player,
    winner?: Player
}

export const GameStateContext = createContext({
    gameState: getInitialGameState(),
    setGameState: (g: SetStateAction<IGameState>) => {}
})

function App(): ReactElement {
    const [gameState, setGameState] = useState(getInitialGameState())
    const [message, setMessage] = useState(getCurrentMessage(gameState.currentPlayer, gameState.winner))
    const gameEngine = useRef(new GameEngine(gameState))

    function getCurrentMessage(currentPlayer: Player, winner?: Player): string {
        const playerName = currentPlayer === Player.CROSS ? 'Player one' : 'Player two'
        return !winner ? `${playerName}'s turn...` : `${playerName} won!`;
    }

    useEffect(() => {
        setMessage(getCurrentMessage(gameState.currentPlayer, gameState.winner));
    }, [gameState.currentPlayer, gameState.winner])

  return (
      <GameStateContext.Provider value={{gameState: gameState, setGameState: setGameState}}>
    <div className="app">
        <Header/>
        <main>
            <div id={'left'}/>
            <section id={'center'}>
                <Board gameEngine={gameEngine.current}/>
                <MessageArea message={message}/>
                <RestartButton gameEngine={gameEngine.current}/>
            </section>
            <SideBar/>
        </main>
        <Footer />

    </div>
      </GameStateContext.Provider>
  );
}

export default App;
