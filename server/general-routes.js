const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("./auth-service");
const db = require("./database-utils");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post("/login", async (req, res) => {
  const users = await db.readUsersFromCSV(db.getDbPath());
  const user = users.find((user) => user.username === req.body.username);
  if (!user) {
    console.log(`No user ${req.body.username} found`);
    return res.status(404).send("No user found.");
  }

  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    console.log(`User ${req.body.username} is not authorized!`);
    return res.status(401).send({ auth: false, token: null });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.EXPIRES_IN || '24h', // expires in 24 hours
    }
  );

  res.status(200).send({ auth: true, token: token });
});

router.get("/api/hello", (req, res) => {
  res.status(200).send("Hello world");
});

module.exports = router;
