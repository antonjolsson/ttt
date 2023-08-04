import React, {ReactElement, useContext} from "react";
import './Sidebar.css'
import {RadioButtonControl} from "./RadioButtonControl";
import {GameStateContext} from "../App";
import {AILevel, GameEngine, Player} from "../GameEngine";

export function SideBar(props: {onSelectGridSize: (option: string) => void,
    onSelectWinLength: (option: string) => void}): ReactElement {
    const gameCtxt = useContext(GameStateContext)

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

    return <div id={'right'}>
        <section id={'sidebar'}>
            <h2>Options</h2>
            <RadioButtonControl label={'AI'} options={Array.from(aiToOptionString.values())} onSelect={onSelectAIPlayer}
                                selected={aiToOptionString.get(gameCtxt.gameState.ai)!}/>
            <RadioButtonControl label={'Level'} options={Object.values(AILevel)} onSelect={onSelectAILevel}
                                selected={String(gameCtxt.gameState.aiLevel)}/>
            <RadioButtonControl options={GameEngine.ALLOWED_GRID_SIZES.map(n => String(n))} label={'Grid size'}
                                selected={String(gameCtxt.gameState.gridSize)} onSelect={props.onSelectGridSize}/>
            <RadioButtonControl options={GameEngine.ALLOWED_WIN_LENGTHS.map(n => String(n))} label={'Win length'}
                                selected={String(Math.min(gameCtxt.gameState.winningRowLength, gameCtxt.gameState.gridSize))}
                                onSelect={props.onSelectWinLength}/>
        </section>
    </div>;
}
