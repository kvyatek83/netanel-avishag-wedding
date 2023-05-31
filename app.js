require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvFile = process.env.DATA_FILE || 'users.csv';


// Create Express app
const app = express();
app.use(express.static(__dirname + '/dist/netanel-avishag-wedding'));
app.use(bodyParser.json());

app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

// CSV
async function readUsersFromCSV() {
  const users = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csvParser())
      .on('data', (row) => {
        users.push(row);
      })
      .on('end', () => {
        resolve(users);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

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
      { id: 'transport', title: 'transport' },
      { id: 'participants', title: 'participants' },
    ],
    append: true,
  });

  return csvWriter.writeRecords([user]);
}

async function updateUserRole(username, newRole) {
  const users = await readUsersFromCSV();
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
      { id: 'transport', title: 'transport' },
      { id: 'participants', title: 'participants' },
    ],
    alwaysQuote: true,
  });

  await csvWriter.writeRecords(users);
}


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

app.post('/login', async (req, res) => {
  const users = await readUsersFromCSV();
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

// Route for guest actions
app.get('/guest', verifyToken, checkRole('guest'), (req, res) => {
  res.status(200).send('Guest action');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
