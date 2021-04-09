const fs = require("fs");
const express = require("express");

const index = fs.readFileSync("index.html", "utf8");

const style = require("./index").generateStyle({
  components: {
    base: { enabled: true },
  },
});

const app = express();

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/index.html", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(index);
});

app.get("/style.json", (req, res) => {
  res.set("Content-Type", "application/json");
  res.send(style);
});

app.listen(3000, () => {
  console.log("Listening at localhost:3000");
});
