require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


const adminRoutes = require('./server/admin-routes');
const guestRoutes = require('./server/guest-routes');
const generalRoutes = require('./server/general-routes');

// const twilio = require('twilio');
// const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Create Express app
const app = express();
app.use(express.static(__dirname + '/dist/netanel-avishag-wedding'));
app.use(bodyParser.json());

app.use('/api', adminRoutes);
app.use('/api', guestRoutes);
app.use('/api', generalRoutes);

app.get('/*', (req, res) => res.sendFile(path.join(__dirname + '/dist/netanel-avishag-wedding/index.html')));



// TWILIO send message
// async function sendWhatsAppMessage(toPhoneNumber, message) {
//   try {
//       console.log(process.env.TWILIO_PHONE_NUMBER);
//       const response = await client.messages.create({
//           body: message,
//           from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
//           to: `whatsapp:${toPhoneNumber}`,
//       });
//       console.log('WhatsApp message sent: ', response.sid);
//       return response.sid;
//   } catch (error) {
//       console.log('Failed to send WhatsApp message: ', error);
//       throw error;
//   }
// }






// app.post('/send-messages', verifyToken, checkRole('admin'), async (req, res) => {
//   try {
//       const users = await db.readUsersFromCSV();
//       const message = req.body.message || 'Hello from the Wedding App!';

//       // Send the message to all users with a phone number
//       await Promise.all(
//           users
//               .filter((user) => !!user.phone)
//               .map((user) => sendWhatsAppMessage(user.phone, message))
//       );

//       res.status(200).send({ success: true, message: 'Messages sent to all users.' });
//   } catch (error) {
//       console.log('Error sending messages to users: ', error);
//       res.status(500).send({ success: false, message: 'Failed to send messages to users.' });
//   }
// });

// Start the server

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
