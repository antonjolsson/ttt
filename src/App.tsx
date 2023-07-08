import React, {useState} from 'react';
import {Header} from "./components/Header";
import {Board} from "./components/Board";
import './App.css'
import {MessageArea} from "./components/MessageArea";

function App() {
    const [message, setMessage] = useState('Player one\'s turn...')
  return (
    <div className="app">
        <Header/>
        <main>
            <Board />
            <MessageArea message={message}/>
        </main>

    </div>
  );
}

export default App;
