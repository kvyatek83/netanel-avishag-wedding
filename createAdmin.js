require('dotenv').config();
const fs = require('fs');
const csvParser = require('csv-parser');
const bcrypt = require('bcryptjs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvFile = process.env.DATA_FILE || 'users.csv';

// Leading zeros
// function wrapStringWithLeadingZeros(str) {
//   if (/^0\d+/.test(str)) {
//     return `="` + str + `"`;
//   }
//   return str;
// }

function parseLeadingZerosPhoneToPrefixPhone(str) {
  if (/^0\d+/.test(str)) {
    const israelPrefix = '+972';
    return `${israelPrefix}${Number(str)}`;
  }
  
  return str;
}


async function createUserInCSV(user) {
  // Leading zeros not sure that nedeeded
  const phone = (typeof user.phone === 'string' && user.phone[0] === '0' ? parseLeadingZerosPhoneToPrefixPhone(user.phone) : user.phone);
  user.phone = phone;

  const csvWriter = createCsvWriter({
    path: csvFile,
    header: [
      { id: 'id', title: 'id' },
      { id: 'username', title: 'username' },
      { id: 'hebrewname', title: 'hebrewname' },
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
  const users = await readUsersFromCSV();

  const existingUser = users.find((user) => user.username === newUser.username);
  if (existingUser) {
    console.log(`Admin user ${newUser.username} already exists.`);
    // process.exit(1);
  } else {
    const hashedPassword = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(8));
    newUser.password = hashedPassword;
  
    await createUserInCSV(newUser);
    console.log(`Admin user ${newUser.username} created successfully!`);
  }
} 

(async () => {
  const newUserAdmin1 = {
    id: '1',
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
    id: '2',
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
