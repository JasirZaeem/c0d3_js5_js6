const express = require("express");
const router = express.Router();

/* User
 * {
 *   id: String,
 *   username: String,
 *   socket: Socket,
 * }
 * */

const userNames = new Set();
const users = {}; // username: User

const generateRoute = (io) => {
  router.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
  });

  router.post("/join", (req, res) => {
    const { username: _username, id } = req.body;
    const username = _username?.trim();

    if (!username)
      return res.status(400).json({ error: "Username is required" });

    if (userNames.has(username))
      return res
        .status(400)
        .json({ error: "Username taken, please choose another" });

    users[id].username = username;
    userNames.add(username);
    users[id].socket.broadcast.emit("joined", username);
    return res.json({ username, id, onlineUsers: Array.from(userNames) });
  });

  io.on("connection", (socket) => {
    users[socket.id] = { id: socket.id, socket, username: null };

    socket.on("disconnect", () => {
      userNames.delete(users[socket.id].username);
      socket.broadcast.emit("left", users[socket.id].username);
      delete users[socket.id];
    });

    socket.on("message", ({ id, text }) => {
      io.emit("message", {
        username: users[id].username,
        text: text.trim(),
      });
    });
  });

  return router;
};

module.exports = generateRoute;
