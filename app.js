require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const { JWT_ACCESS_TOKEN_SECRET } = process.env;

const app = express();

app.use(express.json());

const posts = [
  { username: "carlton", title: "post 1" },
  { username: "jeffrey", title: "post 2" },
];

const authenticateToken = async (req, res, next) => {
  try {
    const bearer = req.header("Authorization");
    if (!bearer) return res.sendStatus(403);
    const [_, accessToken] = bearer.split(" ");
    if (!accessToken) return res.sendStatus(403);
    const user = await jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

app.get("/posts", authenticateToken, (req, res) => {
  const { user } = req;
  res.json(posts.filter((p) => p.username === user.username));
});

module.exports = app;
