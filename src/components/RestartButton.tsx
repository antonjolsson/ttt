import React, {ReactElement, useContext} from "react";
import {GameStateContext} from "../App";
import './RestartButton.css'
import {GameEngine, getInitialGameState} from "../GameEngine";

export function RestartButton(props: {gameEngine: GameEngine}): ReactElement {
    const gameCtxt = useContext(GameStateContext)

    function onClick(): void {
        const initialState = getInitialGameState()
        props.gameEngine.gameState = initialState
        gameCtxt.setGameState(initialState)
    }

    return <div id={'button-container'}>
        <button className={gameCtxt.gameState.winner ? 'visible' : 'hidden'} onClick={onClick}>New Game</button>
    </div>;
}
