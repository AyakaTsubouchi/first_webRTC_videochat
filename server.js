const { createSocket } = require("dgram");
const express = require("express");
const { request } = require("https");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
  // res.redirect(`/`)
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//refer to script.js
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    //when user access the room, it sets up a video room automatically
    socket.join(roomId); //make a socket to join the room
    socket.to(roomId).broadcast.emit("user-connected", userId); //send the message to the current room in

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected",userId);
    });
  });
});

server.listen(3000);
