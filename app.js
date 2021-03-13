const express = require("express");
const app = express();

app.use(express.json());

const js5_1_router = require("./src/js5/1");
const js5_2_router = require("./src/js5/2");

app.get("/", (req, res) => res.send("<h1>Hello</h1>"));
app.use("/js5/1", js5_1_router);
app.use("/js5/2", js5_2_router);

module.exports = app;