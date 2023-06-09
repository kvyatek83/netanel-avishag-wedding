require("dotenv").config();
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
  const users = await db.parseUsersToGuestList();
  res.status(200).send(users);
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
    return savedKeys;
  });

  await db.downloadGuestsCsv(fileName, columns, array);
  return res.download(fileName, () => {
    fs.unlinkSync(fileName);
  });
});

router.get('/admin/download-db', verifyToken, checkRole("admin"), async(req, res) => {
  const dbPath = db.getDbPath();
  res.download(dbPath);
});

router.post('/admin/replace-db', verifyToken, checkRole("admin"), async(req, res) => {
  db.overrideUsersInCSV(req.body.users);

  const users = await db.parseUsersToGuestList();
  res.status(200).send(users);
});

router.post('/admin/save-changes-to-db', verifyToken, checkRole("admin"), async(req, res) => {
  await db.updateUsers(req.body.users);

  const users = await db.parseUsersToGuestList();
  res.status(200).send(users);
});

router.post('/admin/send-message', verifyToken, checkRole("admin"), async(req, res) => {
  // await db.updateUsers(req.body.users);
  console.log(req.body);
  // const users = await db.parseUsersToGuestList();
  
  if (!req.body.message) {
    return res.status(400).send({ message: "Message is empty." });
  }

  if (req.body.users.lenght === 0) {
    return res.status(400).send({ message: "No guests to send." });
  }

  if (req.body.invitation) {
    // change 
    res.status(400).send({ message: "Message is empty." });
  }


  const message = utils.buildGuestLink(req.body.message, process.env.GUEST_LINK);

  // call twilio 
  res.status(200).send({ message: message });
});


module.exports = router;
