import './Board.css'
import '../App.css'
import React, {useContext, useState} from "react";
import {Game, ISquare, Player} from "../Game";
import {GameStateContext} from "../App";

const playerToSymbolMap = new Map<Player, string>([
    [Player.PLAYER_ONE, 'close'],
    [Player.PLAYER_TWO, 'circle']
])

function Square(props: { i: number }) {
    const [symbol, setSymbol] = useState('')
    const gameCtxt = useContext(GameStateContext)

    let player = gameCtxt.gameState.board[props.i].player

    function onClick(): void {
        if (!player) {
            console.log('click')
            const player = gameCtxt.gameState.currentPlayer
            setSymbol(playerToSymbolMap.get(player!)!)
            const newBoard = [...gameCtxt.gameState.board]
            newBoard[props.i].player = player
            gameCtxt.setGameState(
                {...gameCtxt.gameState,
                    currentPlayer: player === Player.PLAYER_ONE ? Player.PLAYER_TWO : Player.PLAYER_ONE,
                    board: newBoard
                })
        }
    }

    return <div className={`square ${!symbol ? " available" : ""}`} onMouseUp={onClick}>
        {symbol && player
            ? <span className={`material-symbols-outlined ${player}`}>{symbol}</span>
            : ''}
    </div>;
}

export function Board(props: {game: Game}) {
    const gameStateCtxt = useContext(GameStateContext)
    const gridSize = gameStateCtxt.gameState.gridSize

    function getGridAxisLayout(): string {
        return Array(gridSize).fill('1fr').join(' ');
    }

    return <div id={'board'}>
        <div id={'board-grid-bg'} style={{gridTemplateRows: getGridAxisLayout(), gridTemplateColumns: getGridAxisLayout()}}>
            {Array(gridSize * gridSize).fill('').map((_, i) =>
                <Square key={i} i={i}/>)}
        </div>
    </div>
}
