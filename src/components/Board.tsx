import './Board.css'
import '../App.css'
import React, {useContext, useState} from "react";
import {Game, Player} from "../Game";
import {GameStateContext} from "../App";
import {ReactComponent as SymbolCross} from './symbols/cross.svg'
import {ReactComponent as SymbolCircle} from './symbols/circle.svg'

const playerToSymbolMap = new Map<Player, string>([
    [Player.CROSS, 'cross'],
    [Player.CIRCLE, 'circle']
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
                    currentPlayer: player === Player.CROSS ? Player.CIRCLE : Player.CROSS,
                    board: newBoard
                })
        }
    }

    function getSymbolComponent() {
        return player === Player.CROSS
            ? <SymbolCross className={'symbol cross'}/>
            : <SymbolCircle className={'symbol circle'}/>;
    }

    return <div className={`square ${!symbol ? " available" : ""}`} onMouseUp={onClick}>
        {symbol && player ? getSymbolComponent() : ''}
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
