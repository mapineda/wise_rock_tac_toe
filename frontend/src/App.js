// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Room from './components/Room';
import CreateRoom from './components/CreateRoom'; // Import your Room component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/join/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
};

export default App;
