import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
  
    const createGame = () => {
      fetch('/create')
        .then(response => response.text())
        .then(roomId => navigate(`/${roomId}`))
        .catch(error => console.error('Error creating game:', error));
    };
  
    return (
      <div>
        <h1>Welcome to TicTacToe</h1>
        <button onClick={createGame}>Create New Game Board</button>
      </div>
    );

}

export default Home;