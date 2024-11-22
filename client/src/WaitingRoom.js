import React from "react";
import { FaUser } from "react-icons/fa";
import "./WaitingRoom.css"; // Make sure to create this CSS file for styling

const WaitingRoom = ({
  room,
  currentUser,
  otherUsers,
  onStartGame,
  isUserAllowedToStartGame,
}) => {
  console.log(room);

  return (
    <div className="waiting-room">
      <h1 className="waiting-room-heading">
        Waiting for Players to Join in Room {room}
      </h1>
      <div className="loading-spinner"></div>
      <h1>YOU</h1>
      <div className="current-user">
        <FaUser className="profile-icon" />
        <span className="username">{currentUser}</span>
      </div>
      <h1>OTHERS</h1>
      <div className="other-users-display">
        {otherUsers.map((user, index) => (
          <div key={index} className="other-users">
            <FaUser className="profile-icon" />
            <span className="username">{user}</span>
          </div>
        ))}
      </div>
      {console.log(isUserAllowedToStartGame)}

      {isUserAllowedToStartGame ? (
        <button className="play-button" onClick={() => onStartGame()}>
          Start Game
        </button>
      ) : (
        <h2>Your friend will start the game soon...</h2>
      )}
    </div>
  );
};

export default WaitingRoom;
