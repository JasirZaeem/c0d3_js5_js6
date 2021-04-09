const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const session = require("express-session");

const app = express();
app.use(
  session({
    secret: "horribly insecure secret",
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: true },
  })
);

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

const { router: js6_1_router } = require("./src/js6/1");
const { resolvers, typeDefs, router: js6_2_router } = require("./src/js6/2");
const js6_3_router = require("./src/js6/3");

//js6_5 is static, see below


//js6_8 is added in ./server.js

const path = require("path");

// App

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
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
app.use("/js6/2", js6_2_router);
app.use("/js6/3", js6_3_router);
app.use("/js6/5", express.static(path.join(__dirname, "src/js6/5")));

module.exports = app;
