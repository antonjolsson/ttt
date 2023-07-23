import React, {ReactElement, useContext, useEffect, useState} from "react";
import './Sidebar.css'
import {RadioButtonControl} from "./RadioButtonControl";
import {InputControl} from "./InputControl";
import {GameStateContext} from "../App";
import {AILevel, GameEngine, getInitialGameState, Player} from "../GameEngine";

export function SideBar(): ReactElement {
    const gameCtxt = useContext(GameStateContext)
    const [gameRunning, setGameRunning] = useState(gameCtxt.gameState.board.some(s => s.player))

    useEffect(() => {
        setGameRunning(gameCtxt.gameState.board.some(s => s.player))
    }, [gameCtxt.gameState.board, gameCtxt.gameState.currentPlayer, gameCtxt.gameState.winner])

    const aiToOptionString = new Map<Player | undefined, string>([
        [undefined, 'None'],
        [Player.CROSS, 'P1'],
        [Player.CIRCLE, 'P2']
    ])

    function onSelectAIPlayer(option: string): void {
        const player = Array.from(aiToOptionString.entries()).find(e => e[1] === option)![0]
        gameCtxt.setGameState({...gameCtxt.gameState, ai: player})
    }

    function onSelectAILevel(option: string): void {
        const level = Array.from(Object.entries(AILevel)).find(e => e[1] === option)![1]
        gameCtxt.setGameState({...gameCtxt.gameState, aiLevel: level})
    }

    function onSelectGridSize(option: string): void {
        if (gameRunning) {
            return
        }
        gameCtxt.gameState.gridSize = parseInt(option)
        const newState = getInitialGameState(gameCtxt.gameState)
        gameCtxt.setGameState(newState)
    }

    return <div id={'right'}>
        <section id={'sidebar'}>
            <h2>Options</h2>
            <RadioButtonControl label={'AI'} options={Array.from(aiToOptionString.values())} onSelect={onSelectAIPlayer}
                                selected={aiToOptionString.get(gameCtxt.gameState.ai)!}/>
            <RadioButtonControl label={'Level'} options={Object.values(AILevel)} onSelect={onSelectAILevel}
                                selected={String(gameCtxt.gameState.aiLevel)}/>
            <RadioButtonControl options={GameEngine.ALLOWED_GRID_SIZES.map(n => String(n))} label={'Grid size'}
                                selected={String(gameCtxt.gameState.gridSize)} onSelect={onSelectGridSize}
                                disabled={gameRunning}/>
            <InputControl label={'Grid size'} default={GameEngine.ALLOWED_GRID_SIZES[0]}/>
        </section>
    </div>;
}
