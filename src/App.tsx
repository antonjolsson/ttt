import React, {createContext, ReactElement, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {AILevel, GameEngine, getInitialGameState, ISquare, Player} from "./GameEngine";
import {RestartButton} from "./components/RestartButton";
import {Footer} from "./components/Footer";
import {SideBar} from "./components/SideBar";

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    gridSize: number,
    ai?: Player,
    winner?: Player,
    aiLevel: AILevel
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

    useEffect(() => {
        if (gameState.ai === gameState.currentPlayer) {
            gameState.currentPlayer = gameEngine.current.getNextPlayer(gameState.currentPlayer)
            const newState = gameEngine.current.update(gameState)
            setGameState({...newState, currentPlayer: newState.currentPlayer, winner: newState.winner,
                board: newState.board})
        }
    }, [gameState, gameState.ai])

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
