import './MessageArea.css'

export function MessageArea(props: {message: string}) {
    return <p id={'message-area'}>{props.message}</p>;
}
