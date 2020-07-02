require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } = process.env;

const refreshTokens = [];

const app = express();

app.use(express.json());

const generateAccessToken = async (user) => {
  return jwt.sign(user, JWT_ACCESS_TOKEN_SECRET, { expiresIn: "3s" });
};

app.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);
    const index = refreshTokens.indexOf(refreshToken);
    if (index < 0) return res.sendStatus(403);
    refreshTokens.splice(index, 1);
    res.sendStatus(204);
  } catch (err) {
    return res.sendStatus(403);
  }
});

app.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.sendStatus(401);
  const user = { username };
  const refreshToken = await jwt.sign(user, JWT_REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  const accessToken = await generateAccessToken(user);
  res.json({ accessToken, refreshToken });
});

app.post("/token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    const user = await jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);
    const accessToken = await generateAccessToken({ username: user.username });
    res.json({ accessToken, refreshToken });
  } catch (err) {
    return res.sendStatus(403);
  }
});

module.exports = app;
