var http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// const PORT = process.env.PORT || 3000;
const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.get("/status", (request, response) => {
  const status = {
    Status: "Running",
  };
  response.send(status);
});

app.get("/words", (request, response) => {
  const words = new Map([
    [
      "test",
      "Take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.",
    ],
    ["task", "A piece of work to be done or undertaken."],
  ]);

  const words_response = { words: Object.fromEntries(words) };
  response.send(words_response);
});
