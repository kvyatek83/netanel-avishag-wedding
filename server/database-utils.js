require("dotenv").config();
const fs = require("fs");
const csvParser = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const utils = require("./utils");

const csvFile = path.resolve(process.env.DATA_FILE || "users.csv");

module.exports = {
  getDbPath() {
    return csvFile;
  },
  async readUsersFromCSV(csvFile) {
    const users = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csvParser())
        .on("data", (row) => {
          users.push(row);
        })
        .on("end", () => {
          resolve(users);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  },
  async createUserInCSV(csvFile, user) {
    const header = Object.keys(user).map((key) => {
      return { id: key, title: key };
    });

    const csvWriter = createCsvWriter({
      path: csvFile,
      header,
      append: true,
    });

    return csvWriter.writeRecords([user]);
  },
  async overrideUsersInCSV(newUsers) {
    const header = Object.keys(newUsers[0]).map((key) => {
      return { id: key, title: key };
    });

    const csvWriter = createCsvWriter({
      path: csvFile,
      header: header,
    });

    csvWriter
      .writeRecords(newUsers)
      .then(() => console.log("Data successfully written to the CSV File."))
      .catch((err) => console.log("Failed to write data into CSV file", err));
  },
  async downloadGuestsCsv(newFileName, header, users) {
    const value = [header]
      .concat(users)
      .map((user) => user.join(","))
      .join("\n");
    fs.writeFileSync(newFileName, value, "utf8", (err) => {
      if (err) console.log("error");
      else console.log("Ok");
    });
  },
  async parseUsersToGuestList() {
    const users = await this.readUsersFromCSV(csvFile);
    return users
      .filter((user) => {
        if (process?.env.HIDE_ADMINS && process.env.HIDE_ADMINS === 'true') {
          return user.role !== "admin";
        }

        return true;
      })
      .map((user) => {
        delete user.password;
        delete user.role;
        const confirmation = utils.stringBooleanToBoolean(user.confirmation);
        const transport = utils.stringBooleanToBoolean(user.transport);
        user.confirmation = confirmation;
        user.transport = transport;
        user.phone = utils.wrapIsraeliPrefixPhoneWithLeadingZeros(user.phone);
        return user;
      });
  },
  async updateUsers(usersToUpdate) {
    const users = await this.readUsersFromCSV(csvFile);

    const header = Object.keys(users[0]).map((key) => {
      return { id: key, title: key };
    });

    usersToUpdate.forEach((newUser) => {
      const userIndex = users.findIndex((user) => user.id === newUser.id);

      if (userIndex !== -1) {
        if (users[userIndex].role !== "admin") {
          newUser.deleted
            ? users.splice(userIndex, 1)
            : (users[userIndex] = newUser);
        }
      } else {
        users.push(newUser);
      }
    });

    const csvWriter = createCsvWriter({
      path: csvFile,
      header: header,
    });

    await csvWriter.writeRecords(users);
  },
  async updateUserStatus(id, confirmation, transport, participants) {
    const users = await this.readUsersFromCSV(csvFile);
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("NOT_FOUND");
    }

    if (!confirmation) {
      transport = false;
      participants = 0;
    }
    
    users[userIndex].confirmation = confirmation;
    users[userIndex].transport = transport;
    users[userIndex].participants = participants;

    const csvWriter = createCsvWriter({
      path: csvFile,
      header: [
        { id: "id", title: "id" },
        { id: "hebrewname", title: "hebrewname" },
        { id: "username", title: "username" },
        { id: "password", title: "password" },
        { id: "role", title: "role" },
        { id: "phone", title: "phone" },
        { id: "email", title: "email" },
        { id: "confirmation", title: "confirmation" },
        { id: "transport", title: "transport" },
        { id: "participants", title: "participants" },
      ],
    });

    await csvWriter.writeRecords(users);
    return users[userIndex];
  },
  getWeddingDetails() {
    return {
      wazeLink: `https://www.waze.com/ul?q=${
        process.env.WAZE_ADDRESS ||
        "%D7%90%D7%98%D7%95%D7%A8%D7%94%20-%20%D7%91%D7%99%D7%AA%20%D7%9C%D7%90%D7%A8%D7%95%D7%A2%D7%99%D7%9D"
      }&navigate=yes`,
      eventName: process.env.EVENT_NAME || "אבישג ונתנאל מתחתנים",
      weddingYear: Number(process.env.WEDDING_YEAR) || 2023,
      weddingMonth: Number(process.env.WEDDING_MONTH) || 10,
      weddingDay: Number(process.env.WEDDING_DAY) || 10,
      weddingHour: Number(process.env.WEDDING_HOUE) || 18,
      weddingMinute: Number(process.env.WEDDING_MINUTE) || 30,
      weddingDetails: Number(process.env.WEDDING_DETAILS) || "",
      weddingDuration: process.env.WEDDING_DURATION || 330,
      weddingLocation: process.env.WEDDING_LOCATION || "אטורה-בית לאירועים",
    };
  },
};
