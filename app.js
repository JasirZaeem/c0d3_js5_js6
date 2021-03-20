const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const app = express();

app.use("/js5/8", express.json({ limit: "1mb" }));
app.use("/js5/9", express.json({ limit: "1mb" }));
app.use(express.json());

// 5

const js5_1_router = require("./src/js5/1");
// const js5_2_router = require("./src/js5/2"); Unsafe
const js5_3_router = require("./src/js5/3");
const js5_4_router = require("./src/js5/4");
const js5_5_router = require("./src/js5/5");
const js5_6_router = require("./src/js5/6");
const js5_7_router = require("./src/js5/7");
const js5_8_router = require("./src/js5/8");
const js5_9_router = require("./src/js5/9");

// 6

const { resolvers, typeDefs, router: js6_1_router } = require("./src/js6/1");

// App

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

app.get("/", (req, res) => res.send("<h1>Hello</h1>"));
app.use("/js5/1", js5_1_router);
// app.use("/js5/2", js5_2_router);
app.use("/js5/3", js5_3_router);
app.use("/js5/4", js5_4_router);
app.use("/js5/5", js5_5_router);
app.use("/js5/6", js5_6_router);
app.use("/js5/7", js5_7_router);
app.use("/js5/8", js5_8_router);
app.use("/js5/9", js5_9_router);

// 6
app.use("/js6/1", js6_1_router);

module.exports = app;
