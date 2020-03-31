const fs = require("fs");
const express = require("express");

const index = fs.readFileSync("index.html", "utf8");

const style = require("./index").generateStyle({
  components: {
    routes: { enabled: true },
    stops: { enabled: true },
    citybikes: { enabled: true },
    municipal_borders: { enabled: true },
    poi: { enabled: true },
    ticket_sales: { enabled: true },
    driver_instructions: { enabled: true },
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
