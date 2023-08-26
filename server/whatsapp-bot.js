require("dotenv").config();
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");


const client = new Client({
  puppeteer: { headless: true },
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
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp bot client is ready!");
});

client.on("disconnected", () => {
  console.log("Whatsapp is disconnected!");
  client.destroy();
  client.initialize();
});

client.on("message", async (msg) => {
  if (msg.body) {
    console.log(`${msg.form} send ${msg.body}`);
    client.sendMessage(
      msg.from,
      "No need to send messages here, just go to the website with the provided link"
    );
  }
});

module.exports = {
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
};
