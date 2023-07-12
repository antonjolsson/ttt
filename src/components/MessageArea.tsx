import './MessageArea.css'
import {ReactElement} from "react";

export function MessageArea(props: {message: string}):  ReactElement {
    return <p id={'message-area'}>{props.message}</p>;
}
