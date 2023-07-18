import React, {ReactElement, useContext} from "react";
import './Sidebar.css'
import {RadioButtonControl} from "./RadioButtonControl";
import {InputControl} from "./InputControl";
import {GameStateContext} from "../App";
import {AILevel, Player} from "../GameEngine";

export function SideBar(): ReactElement {
    const gameCtxt = useContext(GameStateContext)

    const aiToOptionString = new Map<Player | undefined, string>([
        [undefined, 'None'],
        [Player.CROSS, 'P1'],
        [Player.CIRCLE, 'P2']
    ])

    function onSelect(option: string): void {
        const player = Array.from(aiToOptionString.entries()).find(e => e[1] === option)![0]
        gameCtxt.setGameState({...gameCtxt.gameState, ai: player})
    }

    return <div id={'right'}>
        <section id={'sidebar'}>
            <h2>AI</h2>
            <RadioButtonControl label={'Player'} options={Array.from(aiToOptionString.values())} onSelect={onSelect}
                                selected={aiToOptionString.get(gameCtxt.gameState.ai)!}/>
            <RadioButtonControl label={'Level'} options={[AILevel.EASY]} onSelect={(): void => {}}
                                selected={String(gameCtxt.gameState.aiLevel)} disabled={!gameCtxt.gameState.ai}/>
            <InputControl label={'Grid size'} default={3}/>
        </section>
    </div>;
}
