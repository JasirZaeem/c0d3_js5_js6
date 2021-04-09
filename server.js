const app = require("./app");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const js6_8_router = require("./src/js6/8")(io);

app.use("/js6/8", js6_8_router);

http.listen(3000, () => {
  console.log("listening on *:3000");
});
