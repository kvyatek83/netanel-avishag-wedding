const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("./auth-service");
const utils = require("./utils");
const db = require("./database-utils");

const fs = require('fs');

router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.status(200).send("Admin action");
});

router.get("/admin/get-all-guests", verifyToken, checkRole("admin"), async (req, res) => {
  const users = await db.readUsersFromCSV(db.getDbPath());
  res.status(200).send(users.map(user => {
    delete user.password;
    delete user.role;
    const confirmation = utils.stringBooleanToBoolean(user.confirmation);
    const transport = utils.stringBooleanToBoolean(user.transport);
    user.confirmation = confirmation;
    user.transport = transport;
    user.phone = utils.wrapIsraeliPrefixPhoneWithLeadingZeros(user.phone);
    return user;
  }));
});

router.get("/admin/download", verifyToken, checkRole("admin"), async (req, res) => {
  const fileName = req.body.filename || "netanel-avishag-wedding.csv";
  const columns = req.body.columns || [
    "שם",
    "מספר טלפון",
    "מאושר הגעה",
    "מספר משתתפים",
    "הסעה",
  ];
  const keys = req.body.keys || [
    "hebrewname",
    "phone",
    "confirmation",
    "participants",
    "transport",
  ];
  const users = await db.readUsersFromCSV(db.getDbPath());
  const array = users.map((user) => {
    const savedKeys = [];
    keys.forEach((key) => {
      if (user.hasOwnProperty(key)) {
        let value;
        if (utils.checkIfPhoneNumber(user[key])) {
          value = utils.wrapPrefixPhoneWithLeadingZeros(user[key]);
          savedKeys.push(value);
        } else if (utils.checkIfBoolean(user[key])) {
          value = utils.booleanToHebrewBoolean(
            utils.stringBooleanToBoolean(user[key])
          );
          savedKeys.push(value);
        } else {
          savedKeys.push(user[key]);
        }
      }
    });
    // var confirmation = utils.booleanToHebrewBoolean(utils.stringBooleanToBoolean(user.confirmation));
    // var transport = utils.booleanToHebrewBoolean(utils.stringBooleanToBoolean(user.transport));
    // var phone = utils.wrapPrefixPhoneWithLeadingZeros(user.phone);
    // return [user.hebrewname, phone, confirmation, user.participants, transport];

    return savedKeys;
  });

  await db.downloadGuestsCsv(fileName, columns, array);
  return res.download(fileName, () => {
    fs.unlinkSync(fileName);
  });
});

module.exports = router;
