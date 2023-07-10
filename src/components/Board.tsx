import './Board.css'
import '../App.css'
import React, {useEffect, useRef, useState} from "react";
import {Game, ISquare, Player} from "../Game";

function Square(props: { logicSquare: ISquare, game: Game, i: number, playerToSymbolMap: Map<Player, string> }) {
    const [symbol, setSymbol] = useState('')

    function onClick(): void {
        if (!props.logicSquare.player) {
            const player = props.game.currentPlayer
            setSymbol(props.playerToSymbolMap.get(player)!)
            props.game.setSquare(props.i)
        }
    }

    return <div className={`square ${!symbol ? " available" : ""}`} onMouseUp={onClick}>
        {symbol && props.logicSquare.player
            ? <span className={`material-symbols-outlined ${props.logicSquare.player}`}>{symbol}</span>
            : ''}
    </div>;
}

export function Board(props: {game: Game}) {
    const canvasRef =  useRef<HTMLCanvasElement | null>(null)
    const gridSize = props.game.gridSize
    const playerToSymbolMap = new Map<Player, string>([
        [Player.PLAYER_ONE, 'close'],
        [Player.PLAYER_TWO, 'circle']
    ])

    /*function drawBoard(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d')!
        const gridHeight = canvasRef.current!.height
        const gridWidth = canvasRef.current!.width

        ctx.strokeStyle = '#333'
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let i = 1; i < gridSize; i++) {
            ctx.moveTo(0, gridHeight * i / gridSize)
            ctx.lineTo(gridWidth, gridHeight * i / gridSize)
            console.log([0, gridHeight * i / gridSize], [gridHeight, gridHeight * i / gridSize])
        }
        ctx.stroke()
        ctx.lineWidth = 7
        ctx.beginPath()
        for (let i = 1; i < gridSize; i++) {
            ctx.moveTo(i / gridSize * gridWidth, 0)
            ctx.lineTo(i / gridSize * gridWidth, gridHeight)
            console.log([i / gridSize * gridHeight, 0], [i / gridSize * gridHeight, gridHeight])
        }
        ctx.stroke()

    }*/

    useEffect(() => {
        if (canvasRef.current) {
            // drawBoard(canvasRef.current)
        }
    }, [])

    /*return <canvas ref={canvasRef}}>

    </canvas>;*/

    function getGridAxisLayout(): string {
        return Array(gridSize).fill('1fr').join(' ');
    }

    return <div id={'board'}>
        <div id={'board-grid-bg'} style={{gridTemplateRows: getGridAxisLayout(), gridTemplateColumns: getGridAxisLayout()}}>
            {Array(gridSize * gridSize).fill('').map((_, i) =>
                <Square key={i} playerToSymbolMap={playerToSymbolMap} game={props.game} logicSquare={props.game.board[i]} i={i}/>)}
        </div>
    </div>
}
