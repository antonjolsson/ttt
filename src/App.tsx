import React from 'react';
import {Header} from "./Header";
import {Board} from "./Board";
import './App.css'

function App() {
  return (
    <div className="app">
        <Header/>
        <main>
            <Board />
        </main>

    </div>
  );
}

export default App;
