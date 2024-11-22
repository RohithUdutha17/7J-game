// PlayingCard.js
import React, { useEffect, useState } from "react";
import "./PlayingCard.css";

const PlayingCard = ({
  cardFromDeck,
  isCardLeft,
  isCardPicked,
  isYourTurn,
  id,
  leaveCard,
  groupedCard,
  cardNumber,
  handleValue,
  value,
}) => {
  const getSuitColor = (suit) => {
    return suit === "♥" || suit === "♦" ? "red" : "black";
  };

  return (
    <div className="outer-container">
      <div className="cards-container">
        {groupedCard.map((card, index) => {
          //console.log(card.trim() == cardFromDeck.trim());

          return (
            <div
              key={index}
              className="playing-card"
              style={{ color: getSuitColor(card.slice(-1)) }}
            >
              <div className="card-left">{card.slice(0, -1)}</div>
              <div className="card-left">{card.slice(-1)}</div>
              <div className="card-suit-center">{card.slice(-1)}</div>
              <div className="card-right">{card.slice(-1)}</div>
              <div className="card-right">{card.slice(0, -1)}</div>
            </div>
          );
        })}
      </div>
      <div className="leave-button-container">
        <button
          disabled={!isYourTurn || isCardLeft}
          className="leave-button"
          id={id}
          onClick={(e) => leaveCard(e.target.id)}
        >
          Leave
        </button>
        {cardNumber == "7" && groupedCard.length > 1 ? (
          <input
            type="number"
            className="input"
            value={value}
            onChange={(e) => handleValue(e)}
          ></input>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PlayingCard;
