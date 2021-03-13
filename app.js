const express = require("express");
const app = express();

const js5_1_router = require("./src/js5/1");

app.use("/js5/1", js5_1_router);

module.exports = app;
