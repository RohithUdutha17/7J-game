// App.js
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./GamePage.css";
import PlayingCard from "./PlayingCard";
import Chat from "./Chat";
import Deck from "./Deck";
import DisplayResults from "./DisplayResults";

const GamePage = ({
  cardFromDeck,
  remainingCardsWithUsers,
  gameOver,
  challengeScore,
  userWin,
  usersAndScores,
  pickFromOpponent,
  sevensCount,
  isCardLeft,
  pickFromDeck,
  leaveCard,
  sum,
  isYourTurn,
  currentUser,
  isCardPicked,
  cardFromOpponent,
  groupedCards,
  handleGroupedCards,
  joker,
  username,
  message,
  messages,
  sendMessageToAll,
  handleMsgInput,
  handleValue,
  value,
}) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedGroupedCards = Array.from(groupedCards);
    console.log(reorderedGroupedCards);

    const [removed] = reorderedGroupedCards.splice(result.source.index, 1);
    reorderedGroupedCards.splice(result.destination.index, 0, removed);
    console.log(reorderedGroupedCards);

    handleGroupedCards(reorderedGroupedCards);
  };

  return (
    <React.Fragment>
      {!gameOver ? (
        <div className="game-chat">
          <div className="left">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="cards" direction="horizonatal">
                {(provided) => (
                  <div
                    className="card-container"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {groupedCards.map((card, index) => {
                      console.log(typeof card);
                      console.log(card[0], typeof card[0]);
                      console.log("username", username);

                      return (
                        <Draggable
                          key={card[0]}
                          draggableId={card[0]}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <PlayingCard
                                cardFromDeck={cardFromDeck}
                                isCardleft={isCardLeft}
                                isCardPicked={isCardPicked}
                                isYourTurn={isYourTurn}
                                id={card[0]}
                                leaveCard={leaveCard}
                                groupedCard={card[1]}
                                cardNumber={card[0]}
                                handleValue={handleValue}
                                value={value}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Deck
              cardFromDeck={cardFromDeck}
              remainingCardsWithUsers={remainingCardsWithUsers}
              challengeScore={challengeScore}
              pickFromOpponent={pickFromOpponent}
              sevensCount={sevensCount}
              isCardleft={isCardLeft}
              isCardPicked={isCardPicked}
              pickFromDeck={pickFromDeck}
              cardFromOpponent={cardFromOpponent}
              joker={joker}
              currentUser={currentUser}
              sum={sum}
              isYourTurn={isYourTurn}
            />
          </div>
          <div className="right">
            <Chat
              username={username}
              message={message}
              messages={messages}
              sendMessageToAll={sendMessageToAll}
              handleMsgInput={handleMsgInput}
            />
          </div>
        </div>
      ) : (
        <DisplayResults usersAndScores={usersAndScores} userWin={userWin} />
      )}
    </React.Fragment>
  );
};

export default GamePage;
