import logo from "./logo.svg";
import "./App.css";
import RoomForm from "./RoomForm";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import GamePage from "./GamePage";
import Chat from "./Chat";
import WaitingRoom from "./WaitingRoom";

export const socket = io("http://localhost:8000"); // Replace with your server URL

const deck = [
  "A♥",
  "2♥",
  "3♥",
  "4♥",
  "5♥",
  "6♥",
  "7♥",
  "8♥",
  "9♥",
  "10♥",
  "J♥",
  "Q♥",
  "K♥",
  "A♦",
  "2♦",
  "3♦",
  "4♦",
  "5♦",
  "6♦",
  "7♦",
  "8♦",
  "9♦",
  "10♦",
  "J♦",
  "Q♦",
  "K♦",
  "A♣",
  "2♣",
  "3♣",
  "4♣",
  "5♣",
  "6♣",
  "7♣",
  "8♣",
  "9♣",
  "10♣",
  "J♣",
  "Q♣",
  "K♣",
  "A♠",
  "2♠",
  "3♠",
  "4♠",
  "5♠",
  "6♠",
  "7♠",
  "8♠",
  "9♠",
  "10♠",
  "J♠",
  "Q♠",
  "K♠",
];

const pickRandomCards = (deck, num) => {
  const shuffledDeck = deck.sort(() => 0.5 - Math.random());
  return shuffledDeck.slice(0, num);
};

const getGroupedCards = (totalCards) => {
  const uniqueCounts = totalCards.reduce((acc, card) => {
    const rank = card.slice(0, -1);
    acc[rank] = acc[rank] || [];
    acc[rank].push(card);
    return acc;
  }, {});
  return Object.entries(uniqueCounts);
};

function App() {
  const [totalCards, setTotalCards] = useState(pickRandomCards(deck, 7));
  const [groupedCards, setGroupedCards] = useState(() =>
    getGroupedCards(totalCards)
  );
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isGameStart, setIsGameStart] = useState(false);
  const [otherUsers, setOtherUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [userAllowedToStartGame, setUserAllowedToStartGame] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joker, setJoker] = useState("");
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCardPicked, setIsCardPicked] = useState(false);
  const [cardFromOpponent, setCardFromOpponent] = useState("");
  const [sum, setSum] = useState(0);
  const [sevensCount, setSevensCount] = useState(0);
  const [isCardLeft, setIsCardLeft] = useState(false);
  const [value, setValue] = useState(1);
  const [usersAndScores, setUsersAndScores] = useState([]);
  const [userWin, setUserWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [remainingCardsWithUsers, setRemainingCardsWithUsers] = useState([]);
  const [cardFromDeck, setCardFromDeck] = useState([]);

  const usernameRef = useRef(username);
  const sumRef = useRef(sum);
  const roomRef = useRef(room);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    sumRef.current = sum;
  }, [sum]);

  useEffect(() => {
    setSum(getSum(totalCards));
    setGroupedCards(getGroupedCards(totalCards));
  }, [totalCards, joker]);

  useEffect(() => {
    const handleConnection = () => {
      console.log("connected to server");
    };

    const handleRoomCreated = (msg) => {
      setUserLoggedIn(true);
      setUserAllowedToStartGame(true);
    };

    const handleRoomJoined = (room, otherUsers) => {
      setUserLoggedIn(true);
      setOtherUsers(otherUsers.filter((user) => user !== username));
    };

    const handleNewUserJoinedRoom = (user, msg) => {
      setOtherUsers((prevUsers) => [...prevUsers, user]);
    };

    const handleGameStarted = (joker, username, remainingCardsWithUsers) => {
      setIsGameStart(true);
      setJoker(joker);
      setCurrentUser(username);
      setRemainingCardsWithUsers(remainingCardsWithUsers);
    };

    const handleReceiveMsg = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const handleError = (error) => {
      alert(error);
    };

    const handleCardFromDeck = (pickFromDeck) => {
      setTotalCards((prevCards) => [...prevCards, ...pickFromDeck]);
      setCardFromDeck(pickFromDeck);
      setIsCardPicked(true);
    };

    const handleOpponentCard = (
      sevensCount,
      card,
      user,
      remainingCardsWithUsers
    ) => {
      setSevensCount(sevensCount);
      setCardFromOpponent(card);
      if (username === user) {
        setIsYourTurn(true);
      }
      setCurrentUser(user);
      setRemainingCardsWithUsers(remainingCardsWithUsers);
    };

    const handleGetSum = () => {
      socket.emit(
        "check-all-score",
        sumRef.current,
        usernameRef.current,
        roomRef.current
      );
    };

    const handleUserLeft = (userLeft, user, remainingCardsWithUsers) => {
      setRemainingCardsWithUsers(remainingCardsWithUsers);
      if (currentUser !== user) {
        if (username === user) {
          setIsYourTurn(true);
        }
        setCurrentUser(user);
      }
    };

    const handleDisplayResults = (usersAndScores, userWin) => {
      setUsersAndScores(usersAndScores);
      setUserWin(userWin);
      setGameOver(true);
    };

    socket.on("connection", handleConnection);
    socket.on("room created", handleRoomCreated);
    socket.on("room joined", handleRoomJoined);
    socket.on("new user joined room", handleNewUserJoinedRoom);
    socket.on("game-started", handleGameStarted);
    socket.on("receive-msg", handleReceiveMsg);
    socket.on("error", handleError);
    socket.on("card-from-deck", handleCardFromDeck);
    socket.on("opponent-card", handleOpponentCard);
    socket.on("get-sum", handleGetSum);
    socket.on("user left", handleUserLeft);
    socket.on("display-results", handleDisplayResults);

    return () => {
      socket.off("connection", handleConnection);
      socket.off("room created", handleRoomCreated);
      socket.off("room joined", handleRoomJoined);
      socket.off("new user joined room", handleNewUserJoinedRoom);
      socket.off("game-started", handleGameStarted);
      socket.off("receive-msg", handleReceiveMsg);
      socket.off("error", handleError);
      socket.off("card-from-deck", handleCardFromDeck);
      socket.off("opponent-card", handleOpponentCard);
      socket.off("get-sum", handleGetSum);
      socket.off("user left", handleUserLeft);
      socket.off("display-results", handleDisplayResults);
    };
  }, [username, currentUser]);

  const onCreateRoom = (username, room) => {
    setUsername(username);
    setRoom(room);
    console.log("username, room" + username, room, userAllowedToStartGame);
    socket.emit("create room", room, username);
  };

  const onJoinRoom = (username, room) => {
    setUsername(username);
    setRoom(room);
    console.log(username);
    socket.emit("join room", username, room);
  };
  const getSum = (totalCards) => {
    let sum = 0;
    totalCards.forEach((card) => {
      const numberOnCard = card.slice(0, -1);
      if (numberOnCard === joker.slice(0, -1)) {
        sum += 0;
      } else if (numberOnCard === "A") {
        sum += 1;
      } else if (["J", "Q", "K"].includes(numberOnCard)) {
        sum += 10;
      } else {
        sum += parseInt(numberOnCard, 10);
      }
    });
    return sum;
  };

  const handleMsgInput = (e) => {
    setMessage(e.target.value);
  };

  const handleValue = (e) => {
    setValue(e.target.value);
  };

  const sendMessageToAll = () => {
    const messageToBeSent = { username, text: message };
    console.log(messageToBeSent);

    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, messageToBeSent]);
    }
    socket.emit("send-msg", room, messageToBeSent);
    setMessage("");
  };
  const leaveCard = (card) => {
    if (card !== cardFromOpponent.slice(0, -1) && !isCardPicked) {
      alert(
        "You can't leave this card, since it is not matching with Opponent Card"
      );
      return;
    }
    let pickedCardsAndReleaseSeven = false;
    if (card == "7" && card == cardFromOpponent.slice(0, -1) && isCardPicked) {
      pickedCardsAndReleaseSeven = true;
    }

    const indexOfMatchingCard = groupedCards.findIndex(
      (subArray) => subArray[0] === card
    );

    if (
      (value > groupedCards[indexOfMatchingCard][1].length || value < 1) &&
      card === "7"
    ) {
      alert("Invalid operation");
      return;
    }

    let changedValue = value;
    if (card !== "7") {
      changedValue = groupedCards[indexOfMatchingCard][1].length;
    } else {
      setValue(groupedCards[indexOfMatchingCard][1].length - value);
    }

    let totalCardsLength = totalCards.length;
    let updatedTotalCards = [];
    let count = 0;
    for (let i = 0; i < totalCardsLength; i++) {
      if (totalCards[i].slice(0, -1) == card && count < changedValue) {
        count++;
      } else {
        updatedTotalCards.push(totalCards[i]);
      }
    }
    let numberOfCardsWithSameNumber =
      totalCardsLength - updatedTotalCards.length;
    console.log("count" + numberOfCardsWithSameNumber);

    card = groupedCards[indexOfMatchingCard][1][0];
    setIsCardLeft(true);
    setIsCardPicked(false);
    setTotalCards(updatedTotalCards);
    setIsYourTurn(false);

    socket.emit(
      "left-card",
      card,
      numberOfCardsWithSameNumber,
      totalCards.length,
      room,
      pickedCardsAndReleaseSeven
    );
  };

  const handleGroupedCards = (cards) => {
    setGroupedCards(cards);
  };

  const startGame = () => {
    socket.emit("start-game", room, username);
    setIsYourTurn(true);
    setCurrentUser(username);
  };

  const pickFromDeck = () => {
    socket.emit("pick-from-deck", room);
  };

  const pickFromOpponent = () => {
    setTotalCards((prevCards) => [...prevCards, cardFromOpponent]);
    setIsCardPicked(true);
  };

  const challengeScore = () => {
    socket.emit("challenge-score", sum, username, room);
  };

  return (
    <div className="App background">
      {!userLoggedIn ? (
        <div className="content">
          <div className="header">
            <h1>Let's Play 7J</h1>
            <h2>Witness the real entertainment</h2>
          </div>
          <RoomForm onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
        </div>
      ) : isGameStart ? (
        <GamePage
          cardFromDeck={cardFromDeck}
          remainingCardsWithUsers={remainingCardsWithUsers}
          gameOver={gameOver}
          challengeScore={challengeScore}
          userWin={userWin}
          usersAndScores={usersAndScores}
          pickFromOpponent={pickFromOpponent}
          sevensCount={sevensCount}
          isCardLeft={isCardLeft}
          pickFromDeck={pickFromDeck}
          leaveCard={leaveCard}
          sum={sum}
          isYourTurn={isYourTurn}
          currentUser={currentUser}
          isCardPicked={isCardPicked}
          cardFromOpponent={cardFromOpponent}
          groupedCards={groupedCards}
          handleGroupedCards={handleGroupedCards}
          joker={joker}
          username={username}
          message={message}
          messages={messages}
          sendMessageToAll={sendMessageToAll}
          handleMsgInput={handleMsgInput}
          handleValue={handleValue}
          value={value}
        />
      ) : (
        <WaitingRoom
          room={room}
          currentUser={username}
          otherUsers={otherUsers}
          onStartGame={startGame}
          isUserAllowedToStartGame={userAllowedToStartGame}
        />
      )}
    </div>
  );
}
export default App;
