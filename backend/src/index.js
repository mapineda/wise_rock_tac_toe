// server.js
import express from "express";
import http from "http";
import path from "path";
import { Server as socketIO } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;


const app = express();
const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Update with your React app's URL
    methods: ["GET", "POST"],
  },
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: 'jontitor',
  host: 'localhost',
  database: 'tactic',
  password: 'fantastic232',
  port: 5432,
});

let rooms = {};

// Function to generate a unique room ID
const generateRoomId = () => {
  let id = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random string
  while (rooms[id]) {
    id = Math.random().toString(36).substring(2, 8).toUpperCase(); // Regenerate if the ID already exists
  }
  return id;
};

app.use(cors());

// Update the static file serving path
app.use(express.static(path.join(__dirname, "../../frontend/build")));

// Update the root route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

app.get('/create', (req, res) => {
  const roomId = generateRoomId();
  rooms[roomId] = { players: [], ready: false };
  res.redirect(`/${roomId}`);
});

app.get('/:roomId', (req, res) => {
  console.log('this is the room joined');
  const roomId = req.params.roomId;
  if (!rooms[roomId]) {
    res.status(404).send('Room not found');
    return;
  }
  if (rooms[roomId].players.length >= 2) {
    res.status(403).send('Room is full');
    return;
  }
  // Serve the index.html file for all room routes
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

let connectedPlayerCount = 0;

io.on('connection', (socket) => {
  socket.on('createRoom', (newRoom) => {
    console.log('room created');
    const roomId = generateRoomId(); // Generate room ID for the first player
    rooms[roomId] = { players: [], ready: true }; // Initialize room occupancy to 1
    newRoom(roomId);
  });

  socket.on('join', (data) => {
    const roomId = data.roomId;
    const username = data.username;
    console.log(roomId, username);
    if (!rooms[roomId]) {
      socket.emit('error', 'Room not found');
      return;
    } 
    
    if (rooms[roomId].players?.length === 3) {
      io.to(roomId).emit('room-full');
      socket.disconnect();
      return;
    }

    if (rooms[roomId].players?.length < 2 && username) {
      rooms[roomId].players?.push({ id: socket.id, username });
    }
    console.log(rooms[roomId].players);
    socket.join(roomId);
    console.log(`Player joined room ${roomId}. Total players: ${rooms[roomId].players?.length}`);
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS game_events (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255),
        event_type VARCHAR(255),
        event_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    pool.query(createTableQuery)
    .then((res) => {
      console.log('game_events table created or already exists');
    })
    .catch((err) => {
      console.error('Error creating game_events table:', err);
    });

      io.to(roomId).emit('updatePlayers', rooms[roomId].players?.map(player => player.username));
    });

  socket.on('start-game', ({ roomId }) => {
    const room = rooms[roomId];
    let currentPlayer = room.players[0];
    room.ready = true;
    const query = {
      text: 'INSERT INTO game_events (room_id, event_type, event_data) VALUES ($1, $2, $3)',
      values: [roomId, 'game_started', { currentPlayer }],
    };

    pool.query(query)
      .then((res) => {
        console.log('Game start event saved to the database:', res.rows[0]);
      })
      .catch((err) => {
        console.error('Error saving game start event:', err);
      });
    io.to(roomId).emit('game-started', { currentPlayer: room.players[0] });
  });

  socket.on("makeMove", (data) => {
    console.log('data', data);
    const { roomId, index, updatedGame } = data;
    const query = {
      text: 'INSERT INTO game_events (room_id, event_type, event_data) VALUES ($1, $2, $3)',
      values: [roomId, 'game_move', { index, updatedGame }],
    };

    pool.query(query)
      .then((res) => {
        console.log('Game move event saved to the database:', res.rows[0]);
      })
      .catch((err) => {
        console.error('Error saving game move event:', err);
      });
    io.emit("moveMade", data);
  });

  socket.on("resetGame", (newGame) => {
    io.emit("gameReset", newGame);
  });

  socket.on("disconnect", () => {
    connectedPlayerCount--;
    console.log("User disconnected");
  });

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
