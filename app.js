require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const fs = require('fs');
const csvParser = require('csv-parser');
const { async } = require('rxjs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var utils = require('./server/utils');
var db = require('./server/database-utils');

// const twilio = require('twilio');
// const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const csvFile = path.resolve(process.env.DATA_FILE || 'users.csv');

// Create Express app
const app = express();
app.use(express.static(__dirname + '/dist/netanel-avishag-wedding'));
app.use(bodyParser.json());

app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

// CSV
// async function readUsersFromCSV() {
//   const users = [];
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(csvFile)
//       .pipe(csvParser())
//       .on('data', (row) => {
//         users.push(row);
//       })
//       .on('end', () => {
//         resolve(users);
//       })
//       .on('error', (err) => {
//         reject(err);
//       });
//   });
// }

async function writeUserToCSV(user) {
  const csvWriter = createCsvWriter({
    path: csvFile,
    header: [
      { id: 'id', title: 'id' },
      { id: 'username', title: 'username' },
      { id: 'password', title: 'password' },
      { id: 'role', title: 'role' },
      { id: 'phone', title: 'phone' },
      { id: 'email', title: 'email' },
      { id: 'confirmation', title: 'confirmation' },
      { id: 'transport', title: 'transport' },
      { id: 'participants', title: 'participants' },
    ],
    append: true,
  });

  return csvWriter.writeRecords([user]);
}

async function updateUserRole(username, newRole) {
  const users = await db.readUsersFromCSV(csvFile);
  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].role = newRole;

  // Re-write the entire CSV with the updated information
  const csvWriter = createCsvWriter({
    path: csvFile,
    header: [
      { id: 'id', title: 'id' },
      { id: 'username', title: 'username' },
      { id: 'password', title: 'password' },
      { id: 'role', title: 'role' },
      { id: 'phone', title: 'phone' },
      { id: 'email', title: 'email' },
      { id: 'confirmation', title: 'confirmation' },
      { id: 'transport', title: 'transport' },
      { id: 'participants', title: 'participants' },
    ],
    alwaysQuote: true,
  });

  await csvWriter.writeRecords(users);
}

async function getUserByName(username) {
  const users = await db.readUsersFromCSV(csvFile);
  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    throw new Error(`User ${username} not found`);
  }

  return users[userIndex];
}


// async function downloadGuestsCsv() {
//   const users = await db.readUsersFromCSV(csvFile);
//   const header = ['שם', 'מספר טלפון', 'מאושר הגעה', 'מספר משתתפים', 'הסעה']
//   const array = users.map(user => {

//     // Utils method
//     var confirmation = utils.booleanToHebrewBoolean(utils.stringBooleanToBoolean(user.confirmation));
//     var transport = utils.booleanToHebrewBoolean(utils.stringBooleanToBoolean(user.transport));
//     var phone = utils.wrapPrefixPhoneWithLeadingZeros(user.phone);
//     return [user.hebrewname, phone, confirmation, user.participants, transport];
//   })

//   const value = [header].concat(array).map(val => val.join(',')).join('\n');
//   fs.writeFileSync('newFile.csv', value, 'utf8', (err) => {
//     if(err) console.log('error');
//     else console.log('Ok');
//   })
// }

// Middleware to verify JWT

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

// Middleware to check user role
function checkRole(role) {
  return function (req, res, next) {
    if (req.userRole === role) {
      next();
    } else {
      res.status(403).send({ auth: false, message: 'Insufficient role for this action.' });
    }
  };
}

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


app.post('/login', async (req, res) => {
  const users = await db.readUsersFromCSV(csvFile);
  const user = users.find((user) => user.username === req.body.username);
  if (!user) {
    console.log(`No user ${req.body.username} found`);
    return res.status(404).send('No user found.');
  }

  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    console.log(`User ${req.body.username} is not authorized!`);
    return res.status(401).send({ auth: false, token: null });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN || 86400, // expires in 24 hours
  });

  res.status(200).send({ auth: true, token: token });
});

// Route for admin actions
app.get('/admin', verifyToken, checkRole('admin'), (req, res) => {
  res.status(200).send('Admin action');
});

app.get('/admin/download', async(req, res) => {
  const fileName = req.body.filename || 'netanel-avishag-wedding.csv';
  const columns = req.body.columns || ['שם', 'מספר טלפון', 'מאושר הגעה', 'מספר משתתפים', 'הסעה'];
  const keys = req.body.keys || ['hebrewname', 'phone', 'confirmation', 'participants', 'transport'];
  const users = await db.readUsersFromCSV(csvFile);
  const array = users.map(user => {
    const savedKeys = [];
    keys.forEach(key => {
      if (user.hasOwnProperty(key)) {
        let value;
        if (utils.checkIfPhoneNumber(user[key])) {
          value = utils.wrapPrefixPhoneWithLeadingZeros(user[key]);
          savedKeys.push(value);
        } else if (utils.checkIfBoolean(user[key])) {
          value = utils.booleanToHebrewBoolean(utils.stringBooleanToBoolean(user[key]));
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
  })

  await db.downloadGuestsCsv(fileName, columns, array);
  return res.download(fileName, () => {
    fs.unlinkSync(fileName);
  })
});

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


// Route for guest actions

app.get('/guest', verifyToken, checkRole('guest'), (req, res) => {
  res.status(200).send('Guest action');
});

app.get('/api/hello', (req, res) => {
  res.status(200).send('Hello world');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
