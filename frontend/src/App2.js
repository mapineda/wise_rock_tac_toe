import './App.css';
import React, { useState, useEffect } from "react";
import "./index.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [roomId, setRoomId] = useState(null);
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    currentPlayer: "X",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [playerTurn, setPlayerTurn] = useState("Player A");

  useEffect(() => {
    socket.on("moveMade", (data) => {
      setGame(data.updatedGame);
      setPlayerTurn(data.updatedGame.currentPlayer);
      setErrorMessage("");
    });

    socket.on("gameReset", (newGame) => {
      setGame(newGame);
      setPlayerTurn("Player A");
      setErrorMessage("");
    });

    socket.on('room full', () => {
      alert('Room is full');
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("moveMade");
      socket.off("gameReset");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  const joinRoom = () => {
    socket.emit('join');
    socket.on('joined', (roomId) => {
      setRoomId(roomId);
      setErrorMessage('');
      console.log(`Joined room ${roomId}`);
    });
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  const makeMove = (index) => {
    const squares = [...game.board];

    if (calculateWinner(squares) || squares[index]) {
      setErrorMessage("Invalid move. Please try again.");
      return;
    }

    squares[index] = game.currentPlayer;

    const updatedGame = {
      ...game,
      board: squares,
      currentPlayer: game.currentPlayer === "X" ? "O" : "X",
    };

    socket.emit("makeMove", { index, updatedGame });
  };

  const resetGame = () => {
    const newGame = {
      board: Array(9).fill(null),
      currentPlayer: "X",
    };

    socket.emit("resetGame", newGame);
  };

  const winner = calculateWinner(game.board);

  return (
    <div className="app-container">
      <h1>Welcome to Tic Tac Toe Game</h1>
      <div>
      <h1>Two Player Room</h1>
      {!roomId && (
        <>
          <button onClick={joinRoom}>Join Room</button>
          {errorMessage && <p>{errorMessage}</p>}
        </>
      )}
      {roomId && <p>Room ID: {roomId}</p>}
    </div>
      <div>
        <div className="board">
          {game.board.map((cell, index) => (
            <div
              key={index}
              className={`cell ${winner && winner === cell ? "winner" : ""}`}
              onClick={() => makeMove(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        <p className="current-player">
          {winner
            ? `Player ${winner} wins!`
            : `Current Player: ${playerTurn}`}
        </p>
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      </div>
      {errorMessage && (
        <p className="error-message">{errorMessage}</p>
      )}
    </div>
  );
};

export default App;
