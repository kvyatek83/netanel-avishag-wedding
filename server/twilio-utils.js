require("dotenv").config();

const twilio = require("twilio");
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
  async sendTwilioMessage(userMessage, invitation) {
    const messageMethod =
      process.env.TWILIO_MESSAGE_METHOD === "sms" ? "" : "whatsapp:";
    const whatsappTemplate = {
      body: `${userMessage.message}`,
      from: `${messageMethod}${process.env.TWILIO_PHONE_NUMBER}`,
      to: `${messageMethod}${userMessage.phone}`,
    };

    if (invitation && process.env.TWILIO_MESSAGE_METHOD === "whatsapp") {
      whatsappTemplate["mediaUrl"] = process.env.WEDDING_INVITATION_IMAGE;
    }

    try {
      client.messages
        .create(whatsappTemplate)
        .then((message) => {
          console.log(message.sid);
          return true;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });
    } catch (error) {
        console.log("Failed to send WhatsApp message: ", error);
        return false;
    }
  },
};
