const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

const chatRooms = {}; // roomName: message[];

const Auth = async (req, res, next) => {
  const userResponse = await fetch("https://js5.c0d3.com/auth/api/session", {
    headers: {
      Authorization: req.headers.authorization,
    },
  });
  const user = await userResponse.json();
  if (!user.error) {
    req.user = user;
    next();
  }
  res.status(403).json({ error: "Not logged in" });
};

router.use(Auth);

router.get("/api/session", (req, res) => res.json(req.user));

router.get("/api/:room/messages", (req, res) => {
  const { room } = req.params;
  const messages = chatRooms[room] || (chatRooms[room] = []);
  return res.json(messages);
});

router.post("/api/:room/messages", (req, res) => {
  const { room } = req.params;
  const messages = chatRooms[room] || (chatRooms[room] = []);
  messages.push({ name: req.user.name, message: req.body.message });
  return res.sendStatus(201);
});

module.exports = router;
