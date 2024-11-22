import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa"; // Importing the send icon
import "./Chat.css";
const Chat = ({
  username,
  message,
  messages,
  sendMessageToAll,
  handleMsgInput,
}) => {
  const chatBoxRef = useRef(null);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessageToAll();
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatBoxRef}>
        <div className="chat-header">Chat With Friends</div>
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => handleMsgInput(e)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
        />
        <button onClick={sendMessageToAll}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
