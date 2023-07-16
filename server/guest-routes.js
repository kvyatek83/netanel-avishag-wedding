const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const utils = require("./utils");


router.get("/guest/:id", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(401).send({ message: `missingGuestId` });
  }

  const users = await db.readUsersFromCSV(db.getDbPath());

  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.log(`No user for ${userId} found`);
    return res
      .status(404)
      .send({ message: `wrongGuestId`, params: userId });
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
  const userId = req.params.id;

  if (!userId) {
    return res.status(401).send({ message: `missingGuestId` });
  }

  const users = await db.readUsersFromCSV(db.getDbPath());

  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.log(`No user for ${userId} found`);
    return res
      .status(404)
      .send({ message: `userNotFound`, params: userId });
  }

  res.status(200).send(db.getWeddingDetails());
});

module.exports = router;
