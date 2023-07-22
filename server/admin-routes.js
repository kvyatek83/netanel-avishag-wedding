require("dotenv").config();
const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("./auth-service");
const utils = require("./utils");
const db = require("./database-utils");

const fs = require("fs");

router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.status(200).send("Admin action");
});

router.get(
  "/admin/get-all-guests",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    const users = await db.parseUsersToGuestList();
    res.status(200).send(users);
  }
);

router.get(
  "/admin/download",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
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
  }
);

router.get(
  "/admin/download-db",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const dbPath = db.getDbPath();
      res.download(dbPath);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: `general` });
    }
  }
);

router.post(
  "/admin/replace-db",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    if (!req.body.users || req.body.users.length === 0) {
      return res.status(400).send({ message: `emptyGuestList` });
    }

    db.overrideUsersInCSV(req.body.users);

    const users = await db.parseUsersToGuestList();
    res.status(200).send(users);
  }
);

router.post(
  "/admin/save-changes-to-db",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    if (!req.body.users || req.body.users.length === 0) {
      return res.status(400).send({ message: `emptyGuestList` });
    }

    await db.updateUsers(req.body.users);

    const users = await db.parseUsersToGuestList();
    res.status(200).send(users);
  }
);

router.post(
  "/admin/send-message",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    if (!req.body.message) {
      return res.status(400).send({ message: "Message is empty." });
    }

    if (req.body.users.lenght === 0) {
      return res.status(400).send({ message: "No guests to send." });
    }

    messages = [];
    req.body.users.forEach((user) => {
      const guestInvite = `${process.env.GUEST_LINK}/${user.id}`;
      const message = utils.buildGuestLink(
        req.body.message,
        user.hebrewname,
        guestInvite
      );

      messages.push({ id: user.id, phone: user.phone, message: message });
    });

    // call twilio
    // req.body.invitation

    // return better notification
    res.status(200).send({ messages: messages });
  }
);

module.exports = router;
