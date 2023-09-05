require("dotenv").config();
const fs = require("fs").promises;
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const db = require("./database-utils");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");

let client;
let botIsReady = false;
let qrCode;

const filePath = path.resolve(
  process.env.GUEST_MESSAGES || "guest-messages.csv"
);
const initialData = "hebrewname,phone,message\n";

async function createFileAndInitializeData() {
  try {
    // Check if the file exists
    try {
      await fs.access(filePath);

      // If the file exists, log a message and return
      console.log("guest-messages file already exists:", filePath);
      return;
    } catch (err) {
      // File does not exist, continue creating it and initializing data
    }

    // Create the file and write the initial data
    await fs.writeFile(filePath, initialData, "utf8");
    console.log("guest-messages file was created:", filePath);
  } catch (err) {
    console.error("Error creating or initializing the user file:", err);
  }
}

module.exports = {
  initWhatsappBot() {
    client = new Client({
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      authStrategy: new LocalAuth(),
    });

    client.on("authenticated", (session) => {
      console.log("AUTHENTICATED", session);
    });

    // Check for uncaught exceptions and unhandled promise rejections**: These could abruptly crash your Node.js process or result in the mysterious error you're experiencing
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", function (err) {
      console.log("Caught exception: " + err);
    });

    // Check if Puppeteer is still connected**: If the puppeteer's browser is disconnected due to any reason, you must handle this error.
    // Below is a piece of code that will help you to debug if puppeteer is disconnected.
    client.on("disconnected", (reason) => {
      console.log("Client was logged out", reason);
      botIsReady = false;
    });

    // Handle possible session expiration**: WhatsApp sessions can expire, causing the puppeteer to error out.
    // You can listen for the `auth_failure` event and handle re-authentication in that case
    client.on("auth_failure", (msg) => {
      // Fired if session restore was unsuccessfull
      console.error("AUTHENTICATION FAILURE", msg);
    });

    client.initialize();

    // Connect/Reconnect logic**: You might need to handle the reconnect logic in cases when the connection to the browser is lost. In case of
    // 'qr' events also, if the login is not done within a specific time, the connection gets lost
    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      console.log("QR RECEIVED");
      qrcode.generate(qr, { small: true });
      qrCode = qr;
    });

    client.on("ready", () => {
      console.log("WhatsApp bot client is ready!");
      botIsReady = true;
      createFileAndInitializeData();
    });

    client.on("disconnected", (reason) => {
      console.log("Client was logged out", reason);
      client.destroy();
      botIsReady = false;
      // setup client with new session data, if you want to use an existing session
      client.initialize();
    });

    client.on("message", async (msg) => {
      if (msg.body) {
        console.log(`${msg.from} send ${msg.body}`);

        try {
          if (msg.body !== "חתונה") {
            return;
          }

          const guestPhone = `+${msg.from.replace("@c.us", "")}`;

          const users = await db.readUsersFromCSV(db.getDbPath());

          const guest = users.find((user) => {
            return user.phone === guestPhone;
          });

          if (!guest) {
            return;
          }

          const guestInvite = `${process.env.GUEST_LINK}/${guest.id}`;
          const transportMessage = "במידה ותצא הסעה מהצפון - מיקום ושעה ישלחו בהמשך.";


          client.sendMessage(msg.from, guestInvite);
          client.sendMessage(msg.from, transportMessage);


          const guestMessages = await db.readUsersFromCSV(filePath);

          if (guest) {
            const header = [
              { id: "hebrewname", title: "hebrewname" },
              { id: "phone", title: "phone" },
              { id: "message", title: "message" },
            ];

            const guestIndex = guestMessages.findIndex((guest) => {
              return guest.phone === guestPhone;
            });

            if (guestIndex !== -1) {
              guestMessages[
                guestIndex
              ].message = `${guestMessages[guestIndex].message}\n${msg.body}`;
            } else {
              guestMessages.push({
                hebrewname: guest.hebrewname,
                phone: guest.phone,
                message: msg.body,
              });
            }

            const csvWriter = createCsvWriter({
              path: filePath,
              header: header,
            });

            await csvWriter.writeRecords(guestMessages);
          }
        } catch (error) {
          console.log("WhatsApp bot error", error);
        }
      }
    });
  },
  async sendWhatsAppBotMessage(userMessage, invitation) {
    // Getting chatId from the number.
    // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    console.log(userMessage.phone);
    const chatId = userMessage.phone.substring(1) + "@c.us";
    console.log(chatId);

    const invite = await MessageMedia.fromUrl(
      process.env.WEDDING_INVITATION_IMAGE
    );
    try {
      //   client.isRegisteredUser(chatId).then((isRegistered) => {
      //     if (isRegistered) {
      //       if (invitation) {
      //         client.sendMessage(chatId, invite, {
      //           caption: userMessage.message,
      //         });
      //         return true;
      //       } else {
      //         client.sendMessage(chatId, userMessage.message);
      //         return true;
      //       }
      //     } else {
      //       console.log(`User ${userMessage.id} does not have WhatsApp`);
      //       return false;
      //     }
      //   });
      if (invitation) {
        client.sendMessage(chatId, invite, {
          caption: userMessage.message,
        });
        return true;
      } else {
        client.sendMessage(chatId, userMessage.message);
        return true;
      }
    } catch (error) {
      console.log("WhatsApp bot error");
      throw error;
    }
  },
  getGuestMessagesPath() {
    return filePath;
  },
  getBotStatus() {
    console.log(botIsReady);
    return botIsReady;
  },
  getQrCode() {
    return qrCode;
  },
  async getAllGuestsMessages() {
    return await db.readUsersFromCSV(filePath);
  },
};
