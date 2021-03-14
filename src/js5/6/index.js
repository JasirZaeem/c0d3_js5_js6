const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const jwtSecret = "use better secret in prod";

const users = {};
const emailUsers = {};

router.post("/api/users", async (req, res) => {
  const { username, password, email, ...rest } = req.body;
  if (!username || !username.match(/^[0-9a-z]+$/)) {
    return res.status(400).json({
      error:
        "Username is required and should only contain letters and numbers.",
    });
  }
  if (users[username]) {
    return res.json({
      error: "Username is taken",
    });
  }

  if (!email || !email.match(/^[^\s@]+@[^\s@]+$/)) {
    return res.status(400).json({ error: "Email is not valid" });
  }
  if (emailUsers[email]) {
    return res.json({
      error: "Email in use",
    });
  }

  if (!password || password.length < 5) {
    return res
      .status(400)
      .json({ error: "Password must be at least 5 characters." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  emailUsers[email] = users[username] = {
    username,
    email,
    password: hashedPassword,
    ...rest,
  };
  const token = jwt.sign({ username }, jwtSecret);
  res.status(201).json({ token });
});

router.post("/api/sessions", async (req, res) => {
  const { username, email, password } = req.body;
  const user = users[username] || emailUsers[email];
  if (!user) {
    return res.status(400).json({ error: "username or email does not exist" });
  }
  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (passwordIsValid) {
    return res.json({
      token: jwt.sign({ username: user.username }, jwtSecret),
    });
  }
  return res.status(400).json({ error: "Incorrect password" });
});

router.get("/api/sessions", (req, res) => {
  const [, token] = req.headers.authorization?.split(" ") || [];
  try {
    jwt.verify(token, jwtSecret);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Invalid token" });
  }
});

module.exports = router;
