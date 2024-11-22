import React, { useState } from "react";
import "./Deck.css";

const Deck = ({
  cardFromDeck,
  remainingCardsWithUsers,
  challengeScore,
  pickFromOpponent,
  sevensCount,
  isCardLeft,
  isCardPicked,
  pickFromDeck,
  cardFromOpponent,
  joker,
  currentUser,
  sum,
  isYourTurn,
}) => {
  const getSuitColor = (suit) => {
    return suit === "♥" || suit === "♦" ? "red" : "black";
  };

  return (
    <div className="joker-deck">
      <div className="joker-display">
        <p>
          <strong>JOKER</strong>
        </p>
        <div className="joker">
          <div className="card-left">{joker.slice(0, -1)}</div>
          <div className="card-left">{joker.slice(-1)}</div>
          <div className="card-suit-center">{joker.slice(-1)}</div>
          <div className="card-right">{joker.slice(-1)}</div>
          <div className="card-right">{joker.slice(0, -1)}</div>
        </div>
      </div>
      <div className="item-list">
        <h2 className="heading">CardsLeft</h2>
        {remainingCardsWithUsers.map((item, index) => (
          <h3>
            {item.username} : {item.cardsLeft}
          </h3>
        ))}
      </div>
      <div className="user-turn">
        <h1 className="user">{currentUser}'s turn</h1>
        <div className="sum-display">
          Your Score : <strong>{sum}</strong>
        </div>
      </div>

      <div className="card-display">
        <div className="deck-image">
          <img src={`${process.env.PUBLIC_URL}/deck.png`} alt="Deck" />
        </div>
        <div className="buttons-display">
          <div className="cardFromDeck">
            {console.log(cardFromDeck)}

            {cardFromDeck.map((card, index) => {
              return (
                <span style={{ color: getSuitColor(card.slice(-1)) }}>
                  {card}
                  {index == cardFromDeck.length - 1 ? "" : ","}
                </span>
              );
            })}
          </div>
          <button disabled={!isYourTurn || isCardPicked} onClick={pickFromDeck}>
            {sevensCount == 0
              ? "Pick one card from deck"
              : `pick ${sevensCount} cards from deck`}
          </button>
          <button
            disabled={
              !isYourTurn || sum > 5 || isCardPicked || sevensCount != 0
            }
            onClick={challengeScore}
          >
            Challenge Your Score
          </button>
        </div>
      </div>
      {cardFromOpponent != "" ? (
        <div className="joker-display">
          <button
            disabled={!isYourTurn || isCardPicked || sevensCount != 0}
            onClick={pickFromOpponent}
          >
            Pick from Opponent
          </button>
          <div className="joker">
            <div className="card-left">{cardFromOpponent.slice(0, -1)}</div>
            <div className="card-left">{cardFromOpponent.slice(-1)}</div>
            <div className="card-suit-center">{cardFromOpponent.slice(-1)}</div>
            <div className="card-right">{cardFromOpponent.slice(-1)}</div>
            <div className="card-right">{cardFromOpponent.slice(0, -1)}</div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Deck;
