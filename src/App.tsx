import React, {createContext, ReactElement, SetStateAction, useEffect, useRef, useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {AILevel, GameEngine, getInitialGameState, ISquare, Player} from "./GameEngine";
import {RestartButton} from "./components/RestartButton";
import {Footer} from "./components/Footer";
import {SideBar} from "./components/SideBar";
import {RestartDialog} from "./components/RestartDialog";

export interface IGameState {
    currentPlayer: Player,
    board: ISquare[],
    winningRow: ISquare[],
    winningRowLength: number
    gridSize: number,
    ai?: Player,
    winner?: Player,
    aiLevel: AILevel,
    draw: boolean
}

export const GameStateContext = createContext({
    gameState: getInitialGameState(),
    setGameState: (g: SetStateAction<IGameState>) => {}
})

function App(): ReactElement {
    const [gameState, setGameState] = useState(getInitialGameState())
    const [message, setMessage] = useState(getCurrentMessage(gameState.currentPlayer, false, gameState.winner))
    const gameEngine = useRef(new GameEngine())
    const [gameRunning, setGameRunning] = useState(gameState.board.some(s => s.player))
    const [pendingGridSize, setPendingGridSize] = useState(-1)

    useEffect(() => {
        const occupiedSquares = gameState.board.reduce((prev, curr) => prev + +!!curr.player, 0)
        setGameRunning(occupiedSquares > 0 && !gameState.winner && !gameState.draw)
    }, [gameState.board, gameState.currentPlayer, gameState.winner, gameState.draw])

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

    useEffect(() => {
        if (!gameRunning && pendingGridSize > -1 && pendingGridSize !== gameState.gridSize) {
            onSelectGridSize(pendingGridSize)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameRunning])

    function onSelectGridSize(size: number): void {
        if (gameRunning) {
            setPendingGridSize(size)
            return
        }
        gameState.gridSize = size
        const newState = getInitialGameState(gameState)
        setGameState(newState)
        setPendingGridSize(-1)
    }

    function onRestartDialogAction(restart: boolean): void {
        if (restart) {
            console.log('restart!')
            setGameRunning(false)
        } else {
            setPendingGridSize(gameState.gridSize)
        }
    }

    function onSelectWinLength(length: number): void {
        gameState.winningRowLength = length
        gameEngine.current.checkForEndCondition(gameState)
        setGameState({...gameState})
    }

    return (
      <GameStateContext.Provider value={{gameState: gameState, setGameState: setGameState}}>
    <div className="app">
        <RestartDialog show={gameRunning && pendingGridSize > -1 && pendingGridSize !== gameState.gridSize}
                       onRestart={onRestartDialogAction}/>
        <Header/>
        <main>
            <div id={'left'}/>
            <section id={'center'}>
                <Board gameEngine={gameEngine.current}/>
                <MessageArea message={message}/>
                <RestartButton gameEngine={gameEngine.current}/>
            </section>
            <SideBar onSelectGridSize={(option: string): void => onSelectGridSize(parseInt(option))}
                     onSelectWinLength={(option: string): void => onSelectWinLength(parseInt(option))}/>
        </main>
        <Footer />

    </div>
      </GameStateContext.Provider>
  );
}

export default App;
