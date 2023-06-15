const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("./auth-service");
const db = require("./database-utils");

// app.get('/guest', verifyToken, checkRole('guest'), (req, res) => {
//     res.status(200).send('Guest action');
//   });

router.get("/guest/:id", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    res.status(404).send("User id not sent");
  }

  const users = await db.readUsersFromCSV(csvFile);

  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.log(`No user for ${userId} found`);
    return res.status(404).send("No user found.");
  }

  // return all needed properties for guest invite
  res.status(200).send(user.username);
});

module.exports = router;
