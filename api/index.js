const express = require("express");
const nocache = require("nocache");

const api = express();
api.use(nocache());

api.get("/api", (req, res, next) => {
  res.type("application/json");
  res.send(`Hello, World!`);
});

api.get("/api/foo", (req, res) => {
  res.send("foo");
});

module.exports = api;
