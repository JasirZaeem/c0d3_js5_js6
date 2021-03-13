const express = require("express");
const path = require("path");
const router = express.Router();
const { execFile } = require("child_process");

// List of allowed commands
const allowedCommands = ["ls", "pwd", "cat"];

router.get("/commands", (req, res) =>
  res.sendFile(path.join(__dirname + "/commands.html"))
);

router.post("/commands/api", (req, res) => {
  const [command, ...args] = req.body.command.trim().split(" ");

  if (!allowedCommands.includes(command)) {
    return res.send(JSON.stringify({ error: "Command not allowed." }));
  }

  console.log(
    `${new Date().toString()} commands: running "${command} ${args.join(" ")}"`
  );
  execFile(command, args, (error, stdout, stderr) => {
    if (error) {
      return res.json({ error });
    }
    if (stderr) {
      return res.json({ error: stderr });
    }
    return res.json({ output: stdout });
  });
});

module.exports = router;
