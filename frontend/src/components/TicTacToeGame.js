// TicTacToeBoard.js
import React, { useState, useEffect } from 'react';

const TicTacToeBoard = ({ socket, roomId, currentPlayer }) => {
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    currentPlayer: "X",
  });
  const [playerTurn, setPlayerTurn] = useState(currentPlayer);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    socket.on("moveMade", (data) => {
      setGame(data.updatedGame);
      setPlayerTurn(data.updatedGame.currentPlayer);
    });

    socket.on("gameReset", (newGame) => {
      setGame(newGame);
      setPlayerTurn("Player A");
    });

    socket.on('room-full', () => {
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
    console.log('making a move');
    const squares = [...game.board];

    if (calculateWinner(squares) || squares[index]) {
      setErrorMessage("Invalid move. Please try again.");
      return;
    }

    squares[index] = game.currentPlayer;
    console.log(game.currentPlayer);

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
    <div>
    <div style={styles.board}>
      {game.board.map((cell, index) => (
        <div
          key={index}
          style={styles.cell}
          className={`cell ${winner && winner === cell ? "winner" : ""}`}
          onClick={() => makeMove(index)}
        >
          {cell}
        </div>
      ))}
    </div>
    <p style={styles.currentPlayer}>
      {winner
        ? `Player ${winner} wins!`
        : `Current Player: ${playerTurn}`}
    </p>
    <button style={styles.resetButton} onClick={resetGame}>
      Reset Game
    </button>
  </div>
  );
};


const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 100px)',
    gridTemplateRows: 'repeat(3, 100px)',
    gap: '5px',
    border: '2px solid black',
    padding: '5px',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '1px solid black',
    cursor: 'pointer',
  },
  cellHover: {
    backgroundColor: 'lightgray',
  },
  winner: {
    backgroundColor: 'lightgreen',
  },
  currentPlayer: {
    marginTop: '10px',
  },
  resetButton: {
    marginTop: '10px',
    padding: '5px 10px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default TicTacToeBoard;
