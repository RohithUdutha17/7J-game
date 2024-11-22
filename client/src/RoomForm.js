import React, { useState } from "react";
import "./App.css";

const RoomForm = ({ onCreateRoom, onJoinRoom }) => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateRoom(username, room);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onJoinRoom(username, room);
    }
  };

  const validateForm = () => {
    if (!username || !room) {
      setError("Username and Room Number are required.");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <form className="form-container">
      <div>
        <label>User Name:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          required
        />
      </div>
      <div>
        <label>Room Number:</label>
        <input
          type="text"
          value={room}
          onChange={(e) => {
            setRoom(e.target.value);
            setError("");
          }}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="buttons">
        <button className="when-hover" onClick={handleCreateRoom}>
          Create Room
        </button>
        <button className="when-hover" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>
    </form>
  );
};

export default RoomForm;
