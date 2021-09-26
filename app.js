const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser,getRoomUsers, userLeave } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Variables
const botName = "CHATAPP Bot";

//Run when client connects
io.on("connection", (socket) => {
  //console.log('New WS Connection.....');

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //Emits to a single client
    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to the CHATAPP!!"));

    //Broadcast when a user connects, this emits to everyone except self
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} has joined the chat`));

    //Emits to Everyone, even self
    // io.emit()

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  //Listen for chatMessage, which comes from mainjs
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    //Emitting back to server
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    
    if(user){
    io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
    }

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })

  });
});

//PORT DETAILS
const port = 3000 || process.env.PORT;

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});
