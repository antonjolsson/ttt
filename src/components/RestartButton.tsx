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

    return  <button onClick={onClick}>New Game</button>
}
