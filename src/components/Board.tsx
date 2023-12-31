import './Board.css'
import '../App.css'
import React, {ReactElement, useContext, useEffect, useState} from "react";
import {GameEngine, Player} from "../GameEngine";
import {GameStateContext} from "../App";
import {ReactComponent as SymbolCross} from './symbols/cross.svg'
import {ReactComponent as SymbolCircle} from './symbols/circle.svg'

const playerToSymbolMap = new Map<Player, string>([
    [Player.CROSS, 'cross'],
    [Player.CIRCLE, 'circle']
])

function Square(props: { gameEngine: GameEngine, i: number }): ReactElement {
    const [symbol, setSymbol] = useState('')
    const gameCtxt = useContext(GameStateContext)

    let player = gameCtxt.gameState.board[props.i]?.player

    useEffect(() => {
        if (!player) {
            setSymbol('')
        }
        setSymbol(!player ? '' : player)
    }, [player])

    function onClick(): void {
        if (!player && !gameCtxt.gameState.winner) {
            const player = gameCtxt.gameState.currentPlayer
            setSymbol(playerToSymbolMap.get(player!)!)
            gameCtxt.gameState.board[props.i].player = player
            props.gameEngine.update(gameCtxt.gameState)
            gameCtxt.setGameState({...gameCtxt.gameState, board: [...gameCtxt.gameState.board]})
        }
    }

    function getSymbolComponent(): ReactElement {
        return player === Player.CROSS
            ? <SymbolCross className={'symbol cross'}/>
            : <SymbolCircle className={'symbol circle'}/>;
    }

    function getClassName(): string {
        let name =  `square`
        if (player) {
            name += ` ${playerToSymbolMap.get(player)}`
        }
        if (!symbol && !gameCtxt.gameState.winner) {
            name += ' available'
        } else if (gameCtxt.gameState.board[props.i]?.inWinningRow) {
            name += ' winning-square'
        }

        const size = gameCtxt.gameState.gridSize
        if (props.i < size) {
            name += ' first-row'
        } else if (props.i >= size * size - size) {
            name += ' last-row'
        }
        if (props.i % size === 0) {
            name += ' leftmost-column'
        } else if ((props.i + 1) % size === 0) {
            name += ' rightmost-column'
        }
        return name
    }

    return <div className={getClassName()} onMouseUp={onClick}>
        {symbol && player ? getSymbolComponent() : ''}
    </div>;
}

export function Board(props: {gameEngine: GameEngine}): ReactElement {
    const gameStateCtxt = useContext(GameStateContext)
    const gridSize = gameStateCtxt.gameState.gridSize
    const [gapSize, setGapSize] = useState('3%')

    useEffect(() => {
        setGapSize(`${9 / gridSize}%`)
    }, [gridSize])

    function getGridAxisLayout(): string {
        return Array(gridSize).fill('1fr').join(' ');
    }

    return <div id={'board'}>
        <div id={'board-grid-bg'} style={{
            gridTemplateRows: getGridAxisLayout(),
            gridTemplateColumns: getGridAxisLayout(),
            gap: gapSize}}>
            {Array(gridSize * gridSize).fill('').map((_, i) =>
                <Square gameEngine={props.gameEngine} key={i} i={i}/>)}
        </div>
    </div>
}
