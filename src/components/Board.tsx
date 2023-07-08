import './Board.css'
import {useEffect, useRef} from "react";

const GRID_SIZE = 3

export function Board() {
    const canvasRef =  useRef<HTMLCanvasElement | null>(null)

    function initGame(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d')!
        const gridHeight = canvasRef.current!.height
        const gridWidth = canvasRef.current!.width

        ctx.strokeStyle = '#333'
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let i = 1; i < GRID_SIZE; i++) {
            ctx.moveTo(0, gridHeight * i / GRID_SIZE)
            ctx.lineTo(gridWidth, gridHeight * i / GRID_SIZE)
            console.log([0, gridHeight * i / GRID_SIZE], [gridHeight, gridHeight * i / GRID_SIZE])
        }
        ctx.stroke()
        ctx.lineWidth = 7
        ctx.beginPath()
        for (let i = 1; i < GRID_SIZE; i++) {
            ctx.moveTo(i / GRID_SIZE * gridWidth, 0)
            ctx.lineTo(i / GRID_SIZE * gridWidth, gridHeight)
            console.log([i / GRID_SIZE * gridHeight, 0], [i / GRID_SIZE * gridHeight, gridHeight])
        }
        ctx.stroke()

    }

    useEffect(() => {
        if (canvasRef.current) {
            initGame(canvasRef.current)
        }
    }, [])

    return <canvas ref={canvasRef}>

    </canvas>;
}
