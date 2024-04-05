// CreateRoom.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const CreateRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const createRoom = () => {
    const socket = io("http://localhost:5000/");
    socket.on('connect_error', (error) => {
      setErrorMessage('Failed to connect to server. Please try again later.');
      console.error('WebSocket connection error:', errorMessage);
    });

    socket.emit('createRoom', (newRoomId) => {
      setRoomId(newRoomId);
    });
  };

  return (
    <div>
      {!roomId ? ( <>
      <h2>Create a New Room</h2>
      <button onClick={createRoom}>Create Room</button></>
  ) : (
        <div>
          <p>Room ID: {roomId}</p>
          <p>Share this ID with your friend to join the room.</p>
          <Link to={`/join/${roomId}`}><button>Join Room</button></Link>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;
