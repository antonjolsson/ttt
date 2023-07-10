import React, {useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";
import {Game} from "./Game";

function App() {
    const [message, setMessage] = useState('Player one\'s turn...')
    const game = new Game()
  return (
    <div className="app">
        <Header/>
        <main>
            <Board game={game}/>
            <MessageArea message={message}/>
        </main>

    </div>
  );
}

export default App;
