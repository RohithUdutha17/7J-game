const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const port = process.env.PORT || 4000;
const { Server } = require("socket.io");
const { log } = require("console");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

class Room {
  constructor() {
    this.sevensCount = 0;
    this.totalDeckOfCards = [];
    this.users = {};
    this.userList = [];
    this.currentIndex = 0;
    this.numberOfUsers = 0;
    this.usersAndScores = [];
    this.remainingCardWithUsers = [];
  }

  getTotalDeckOfCards() {
    let totalCards = [];
    for (let i = 0; i < Math.ceil(this.userList.length / 3); i++) {
      totalCards = [...totalCards, ...originalDeck];
    }
    return totalCards;
  }

  shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  getJoker() {
    while (true) {
      const randomIndex = Math.floor(
        Math.random() * this.totalDeckOfCards.length
      );
      const joker = this.totalDeckOfCards[randomIndex];
      if (joker.slice(0, -1) != "7" && joker.slice(0, -1) != "J") {
        this.totalDeckOfCards.splice(randomIndex, 1);
        return joker;
      }
    }
  }
}

const roomsList = {}; // Object to store Room instances

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("create room", (room, user) => {
    if (!roomsList[room]) {
      roomsList[room] = new Room();
      socket.join(room);
      roomsList[room].users[socket.id] = user;
      roomsList[room].userList.push(user);
      console.log(`Room created: ${room}, added ${user} to room`);
      socket.emit("room created", `Room ${room} created successfully`);
    } else {
      console.log("error room exists");
      socket.emit("error", `Room ${room} already exists`);
    }
  });

  socket.on("join room", (username, room) => {
    if (roomsList[room]) {
      socket.join(room);
      roomsList[room].users[socket.id] = username;
      roomsList[room].userList.push(username);
      console.log(`${username} joined room: ${room}`);
      socket.emit("room joined", room, roomsList[room].userList);
      socket
        .to(room)
        .emit(
          "new user joined room",
          username,
          `${username} joined room: ${room}`
        );
    } else {
      console.log("error room does not exist");
      socket.emit("error", `Room ${room} does not exist`);
    }
  });

  socket.on("send-msg", (room, msg) => {
    socket.to(room).emit("receive-msg", msg);
  });

  socket.on("pick-from-deck", function pickFromDeckHandler(room) {
    const roomInstance = roomsList[room];
    console.log(room);

    let pickFromDeck = [];
    if (roomInstance.sevensCount == 0) {
      pickFromDeck = roomInstance.totalDeckOfCards.slice(0, 1);
      roomInstance.totalDeckOfCards.splice(0, 1);
    } else {
      pickFromDeck = roomInstance.totalDeckOfCards.slice(
        0,
        roomInstance.sevensCount
      );
      roomInstance.totalDeckOfCards.splice(0, roomInstance.sevensCount);
    }
    if (pickFromDeck.length == 0) {
      roomInstance.totalDeckOfCards = roomInstance.getTotalDeckOfCards();
      roomInstance.totalDeckOfCards = roomInstance.shuffleCards(
        roomInstance.totalDeckOfCards
      );
      pickFromDeckHandler(room);
      return; // Ensure to return to avoid further execution
    }
    console.log(pickFromDeck);
    socket.emit("card-from-deck", pickFromDeck);
  });

  socket.on("challenge-score", (sum, username, room) => {
    const roomInstance = roomsList[room];
    roomInstance.usersAndScores.push({ username: username, sum: sum });
    socket.to(room).emit("get-sum");
  });

  socket.on("check-all-score", (sum, username, room) => {
    const roomInstance = roomsList[room];
    console.log(sum, username, room);

    roomInstance.usersAndScores.push({ username: username, sum: sum });
    if (roomInstance.usersAndScores.length == roomInstance.userList.length) {
      let userWin = true;
      for (let i = 1; i < roomInstance.usersAndScores.length; i++) {
        if (
          roomInstance.usersAndScores[0].sum >
          roomInstance.usersAndScores[i].sum
        ) {
          userWin = false;
          break;
        }
      }
      if (userWin) {
        roomInstance.usersAndScores[0].sum = 0;
      } else {
        roomInstance.usersAndScores[0].sum =
          20 + roomInstance.usersAndScores[0].sum;
      }
      io.to(room).emit("display-results", roomInstance.usersAndScores, userWin);
    }
  });

  socket.on(
    "left-card",
    (card, count, updatedCardCount, room, pickedCardsAndReleaseSeven) => {
      const roomInstance = roomsList[room];
      const originalCard = card;
      console.log(roomInstance.numberOfUsers, roomInstance.currentIndex);
      if (pickedCardsAndReleaseSeven) {
        roomInstance.sevensCount = 0;
      }
      card = card.slice(0, -1);
      if (card == "J") {
        roomInstance.currentIndex =
          (roomInstance.currentIndex + count) % roomInstance.numberOfUsers;
        roomInstance.sevensCount = 0;
      } else if (card == "7") {
        roomInstance.sevensCount += 2 * count;
      } else {
        roomInstance.sevensCount = 0;
      }
      for (let i = 0; i < roomInstance.remainingCardWithUsers.length; i++) {
        if (
          roomInstance.remainingCardWithUsers[i].username ==
          roomInstance.users[socket.id]
        ) {
          roomInstance.remainingCardWithUsers[i].cardsLeft =
            updatedCardCount - count;
        }
      }
      roomInstance.currentIndex =
        (roomInstance.currentIndex + 1) % roomInstance.numberOfUsers;
      io.to(room).emit(
        "opponent-card",
        roomInstance.sevensCount,
        originalCard,
        roomInstance.userList[roomInstance.currentIndex],
        roomInstance.remainingCardWithUsers
      );
    }
  );

  socket.on("start-game", (room, username) => {
    const roomInstance = roomsList[room];
    roomInstance.totalDeckOfCards = roomInstance.getTotalDeckOfCards();
    roomInstance.totalDeckOfCards = roomInstance.shuffleCards(
      roomInstance.totalDeckOfCards
    );
    const joker = roomInstance.getJoker();
    roomInstance.numberOfUsers = roomInstance.userList.length;
    roomInstance.userList.forEach((user) => {
      roomInstance.remainingCardWithUsers.push({
        username: user,
        cardsLeft: 7,
      });
    });
    io.to(room).emit(
      "game-started",
      joker,
      username,
      roomInstance.remainingCardWithUsers
    );
  });

  socket.on("leave room", (room) => {
    const roomInstance = roomsList[room];
    if (roomInstance) {
      const username = roomInstance.users[socket.id];
      roomInstance.userList = roomInstance.userList.filter(
        (user) => user !== username
      );
      delete roomInstance.users[socket.id];
      socket.leave(room);
      console.log(`User left room: ${room}`);
      socket.emit("room left", `You have left room: ${room}`);
      if (roomInstance.userList.length === 0) {
        delete roomsList[room];
      } else {
        io.to(room).emit("user left", username, roomInstance.userList);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (const room in roomsList) {
      const roomInstance = roomsList[room];
      const username = roomInstance.users[socket.id];
      if (username) {
        roomInstance.userList = roomInstance.userList.filter(
          (user) => user !== username
        );
        roomInstance.usersAndScores = roomInstance.usersAndScores.filter(
          (user) => username != user.username
        );
        roomInstance.remainingCardWithUsers =
          roomInstance.remainingCardWithUsers.filter(
            (user) => username !== user.username
          );
        roomInstance.numberOfUsers = roomInstance.userList.length;
        delete roomInstance.users[socket.id];
        if (roomInstance.userList.length === 0) {
          delete roomsList[room];
        } else {
          console.log("user left", username);
          console.log(roomInstance.userList[roomInstance.currentIndex - 1]);

          io.to(room).emit(
            "user left",
            username,
            roomInstance.userList[roomInstance.currentIndex],
            roomInstance.remainingCardWithUsers
          );
        }
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Random card is :");
});

server.listen(port, () => {
  console.log(`Example app listening at port ${port}`);
});

const originalDeck = [
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
