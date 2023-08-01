import React, {KeyboardEventHandler, ReactElement, useEffect, useRef, useState} from "react";
import './RestartDialog.css'

export function RestartDialog(props: { onRestart: (restart: boolean) => void, show: boolean }): ReactElement {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [dialogClass, setDialogClass] = useState('initial')

    useEffect(() => {
        if (props.show) {
            dialogRef.current?.showModal()
            setDialogClass('visible')
        } else if (dialogClass === 'visible') {
            setDialogClass('hidden')
            setTimeout(() => {
                dialogRef.current?.close()
            }, 150)

        }
    }, [props.show])

    function onKeyUp(e: React.KeyboardEvent<HTMLDialogElement>): void {
        props.onRestart(e.key === 'Enter')
    }

    return (
    <dialog ref={dialogRef} id={'restart-dialog'} className={dialogClass}
            onKeyUp={(e): void => onKeyUp(e)}>
        <p>This will restart the game.</p>
        <button className={'confirm'} onClick={(): void => props.onRestart(true)}>OK</button>
        <button className={'cancel'} onClick={(): void => props.onRestart(false)}>Cancel</button>
    </dialog>
    )
}
