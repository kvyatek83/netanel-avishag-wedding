require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const bcrypt = require('bcryptjs');
var utils = require('./server/utils');
var db = require('./server/database-utils');

const csvFile = path.resolve(process.env.DATA_FILE || 'users.csv');

// Admin 1
const adminUsername1 = process.env.ADMIN_USERNAME_1;
const adminHebname1 = process.env.ADMIN_HEBNAME_1;
const adminPassword1 = process.env.ADMIN_PASSWORD_1;
const adminPhone1 = process.env.ADMIN_PHONE_1;
const adminEmail1 = process.env.ADMIN_EMAIL_1;
const adminTransport1 = process.env.ADMIN_TRANSPORT_1;
const adminParticipants1 = process.env.ADMIN_PAETICIPANTS_1;

// Admin 2
const adminUsername2 = process.env.ADMIN_USERNAME_2;
const adminHebname2 = process.env.ADMIN_HEBNAME_2;
const adminPassword2 = process.env.ADMIN_PASSWORD_2;
const adminPhone2 = process.env.ADMIN_PHONE_2;
const adminEmail2 = process.env.ADMIN_EMAIL_2;
const adminTransport2 = process.env.ADMIN_TRANSPORT_2;
const adminParticipants2 = process.env.ADMIN_PAETICIPANTS_2;

async function createAdminUser(newUser) {
  const users = await db.readUsersFromCSV(csvFile);

  const existingUser = users.find((user) => user.username === newUser.username);
  if (existingUser) {
    console.log(`Admin user ${newUser.username} already exists.`);
    // process.exit(1);
  } else {
    const hashedPassword = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(8));
    newUser.password = hashedPassword;
    utils.parseLeadingZerosPhoneToPrefixPhone(newUser);

    await db.createUserInCSV(csvFile, newUser);
    console.log(`Admin user ${newUser.username} created successfully!`);
  }
} 

(async () => {
  const newUserAdmin1 = {
    id: uuidv4(),
    username: adminUsername1,
    hebrewname: adminHebname1,
    password: adminPassword1,
    role: 'admin',
    phone: adminPhone1,
    email: adminEmail1,
    confirmation: true,
    transport: adminTransport1,
    participants: adminParticipants1,
  };

  const newUserAdmin2 = {
    id: uuidv4(),
    username: adminUsername2,
    hebrewname: adminHebname2,
    password: adminPassword2,
    role: 'admin',
    phone: adminPhone2,
    email: adminEmail2,
    confirmation: true,
    transport: adminTransport2,
    participants: adminParticipants2,
  };

  await createAdminUser(newUserAdmin1);
  await createAdminUser(newUserAdmin2);
  process.exit(0);
})();
