import React, {createContext, ReactElement, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {AILevel, GameEngine, getInitialGameState, IGameState, ISquare, Player} from "./GameEngine";
import {RestartButton} from "./components/RestartButton";
import {Footer} from "./components/Footer";
import {SideBar} from "./components/SideBar";

export const GameStateContext = createContext({
    gameState: getInitialGameState(),
    setGameState: (g: SetStateAction<IGameState>) => {}
})

function App(): ReactElement {
    const [gameState, setGameState] = useState(getInitialGameState())
    const [message, setMessage] = useState(getCurrentMessage(gameState.currentPlayer, false, gameState.winner))
    const gameEngine = useRef(new GameEngine())

    function getCurrentMessage(currentPlayer: Player, draw: boolean, winner?: Player): string {
        const playerName = currentPlayer === Player.CROSS ? 'Player one' : 'Player two'
        if (winner) {
            return `${playerName} won!`
        } if (draw) {
            return 'Draw!'
        }
        return `${playerName}'s turn...`
    }

    useEffect(() => {
        setMessage(getCurrentMessage(gameState.currentPlayer, gameState.draw, gameState.winner));
    }, [gameState.currentPlayer, gameState.winner, gameState.draw])

    // New turn
    useEffect(() => {
        if (gameState.ai === gameState.currentPlayer) {
            gameState.currentPlayer = gameEngine.current.getNextPlayer(gameState.currentPlayer)
            gameEngine.current.update(gameState)
            setGameState({...gameState, board: [...gameState.board]})
        }
    }, [gameState.ai, gameState.board, gameState.currentPlayer])

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
