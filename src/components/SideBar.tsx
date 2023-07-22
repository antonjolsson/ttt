import React, {ReactElement, useContext} from "react";
import './Sidebar.css'
import {RadioButtonControl} from "./RadioButtonControl";
import {InputControl} from "./InputControl";
import {GameStateContext} from "../App";
import {AILevel, GameEngine, Player} from "../GameEngine";

export function SideBar(): ReactElement {
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

    function onSelectGridSize(option: string): void {
        gameCtxt.setGameState({...gameCtxt.gameState, gridSize: parseInt(option)})
    }

    return <div id={'right'}>
        <section id={'sidebar'}>
            <h2>Options</h2>
            <RadioButtonControl label={'AI'} options={Array.from(aiToOptionString.values())} onSelect={onSelectAIPlayer}
                                selected={aiToOptionString.get(gameCtxt.gameState.ai)!}/>
            <RadioButtonControl label={'Level'} options={Object.values(AILevel)} onSelect={onSelectAILevel}
                                selected={String(gameCtxt.gameState.aiLevel)}/>
            <RadioButtonControl options={GameEngine.ALLOWED_GRID_SIZES.map(n => String(n))} label={'Grid size'}
                                selected={String(gameCtxt.gameState.gridSize)} onSelect={onSelectGridSize}/>
            <InputControl label={'Grid size'} default={3}/>
        </section>
    </div>;
}
