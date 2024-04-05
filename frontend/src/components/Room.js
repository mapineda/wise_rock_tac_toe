// Room.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import TicTacToeBoard from './TicTacToeGame'; // Import the Tic Tac Toe board component

const Room = () => {
  const { roomId } = useParams(); // Get roomId from URL params
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const [currentPlayer, setCurrentPlayer] = useState(null); // Track the current player
  const [winner, setWinner] = useState(null); // Track the winner

  const socket = io("http://localhost:5000/");

  useEffect(() => {
    // Listen for updates to players list
    socket.on('updatePlayers', (updatedPlayers) => {
      console.log(updatedPlayers);
      setPlayers(updatedPlayers);
    });

    // Listen for game start event
    socket.on('game-started', ({ currentPlayer }) => {
      setGameStarted(true);
      setCurrentPlayer(currentPlayer);
    });

    // Listen for game end event
    socket.on('game-ended', ({ winner }) => {
      setGameStarted(false);
      setWinner(winner);
    });
  });

  const copyRoomUrl = () => {
    const roomUrl = window.location.href;
    navigator.clipboard.writeText(roomUrl)
      .then(() => setCopySuccess(true))
      .catch((error) => console.error('Error copying room URL:', error));
  };

  const joinRoom = () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }
    socket.emit('join', { roomId, username });
  };

  const startGame = () => {
    console.log('start game');
    socket.emit('start-game', { roomId });
  };

  socket.on('error', (errorMessage) => {
    setError(errorMessage);
  });

  socket.on('room-full', () => {
    console.log('room is full')
    alert('Room is full');
  });

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <h2>Room: {roomId}</h2>
          <button onClick={copyRoomUrl}>Copy Room URL</button>
          {copySuccess && <p style={{ color: 'green' }}>Room URL copied to clipboard!</p>}
          <br />
          <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
          <h3>Players in the room:</h3>
          <ul>
            {players?.length && players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
          {players.length >= 2 && !gameStarted && (
            <button onClick={startGame}>Start Game</button>
          )}
          <br/>
          {gameStarted && (
            <div>
              <h3>Game in progress</h3>
              <TicTacToeBoard socket={socket} roomId={roomId} currentPlayer={currentPlayer} />
              {winner && (
                <p>{winner === 'draw' ? 'It\'s a draw!' : `Player ${winner} wins!`}</p>
              )}
            </div>
          )}
          <br />
          <Link to="/">Back to Home</Link>
        </>
      )}
    </div>
  );
};

export default Room;
