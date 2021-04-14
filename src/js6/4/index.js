const express = require("express");
const path = require("path");

const router = express.Router();
// router.use("/static", express.static(path.join(__dirname, "public/static")));
router.get("/bundle.js", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/bundle.js"))
);
router.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
module.exports = router;
