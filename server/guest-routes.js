const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const utils = require("./utils");

// app.get('/guest', verifyToken, checkRole('guest'), (req, res) => {
//     res.status(200).send('Guest action');
//   });

router.get("/guest/:id", async (req, res) => {
  console.log('guest-details');
  const userId = req.params.id;

  if (!userId) {
    res.status(401).send("User id not sent");
  }

  const users = await db.readUsersFromCSV(db.getDbPath());

  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.log(`No user for ${userId} found`);
    return res.status(404).send("No user found.");
  }

  delete user.password;
    delete user.role;
    const confirmation = utils.stringBooleanToBoolean(user.confirmation);
    const transport = utils.stringBooleanToBoolean(user.transport);
    user.confirmation = confirmation;
    user.transport = transport;
    user.phone = utils.wrapIsraeliPrefixPhoneWithLeadingZeros(user.phone);
  res.status(200).send(user);
});

router.get("/guest/:id/wedding-details", async (req, res) => {
  console.log('wedding-details');
  const userId = req.params.id;

  if (!userId) {
    res.status(400).send("User id not sent");
  }

  const users = await db.readUsersFromCSV(db.getDbPath());

  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.log(`No user for ${userId} found`);
    return res.status(404).send("No user found.");
  }

  res.status(200).send(db.getWeddingDetails());
});

module.exports = router;
