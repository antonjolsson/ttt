import React, {ReactElement, useContext, useEffect} from "react";
import {GameStateContext} from "../App";
import './RestartButton.css'
import {GameEngine, getInitialGameState} from "../GameEngine";

export function RestartButton(props: {gameEngine: GameEngine}): ReactElement {
    const gameCtxt = useContext(GameStateContext)

    function onClick(): void {
        console.log(gameCtxt.gameState)
        // const initialState = getInitialGameState(gameCtxt.gameState)
        gameCtxt.setGameState(getInitialGameState(gameCtxt.gameState))
    }

    return <button onClick={onClick}>New Game</button>
}
