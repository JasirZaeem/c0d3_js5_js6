const express = require("express");
const path = require("path");

const router = express.Router();
router.use("/static", express.static(path.join(__dirname, "public/static")));
router.get("/stars", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
router.get("/kanban", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
router.get("/", (req, res) => res.redirect("stars"));

module.exports = router;
