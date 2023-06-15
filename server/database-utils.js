require('dotenv').config();
const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const csvFile = path.resolve(process.env.DATA_FILE || 'users.csv');

module.exports = {
    getDbPath() {
        return csvFile;
    },
    async readUsersFromCSV(csvFile) {
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
    },
    async createUserInCSV(csvFile, user) {
        const header = Object.keys(user).map(key => {
            return { id: key, title: key };
        });

        const csvWriter = createCsvWriter({
          path: csvFile,
          header,
          append: true,
        });
      
        return csvWriter.writeRecords([user]);
    },
    async downloadGuestsCsv(newFileName, header, users) {
        const value = [header].concat(users).map(user => user.join(',')).join('\n');
        fs.writeFileSync(newFileName, value, 'utf8', (err) => {
          if(err) console.log('error');
          else console.log('Ok');
        })
    },
    // async updateUserRole(username, newRole) {
    //     const users = await db.readUsersFromCSV(csvFile);
    //     const userIndex = users.findIndex((user) => user.username === username);
      
    //     if (userIndex === -1) {
    //       throw new Error('User not found');
    //     }
      
    //     users[userIndex].role = newRole;
      
    //     // Re-write the entire CSV with the updated information
    //     const csvWriter = createCsvWriter({
    //       path: csvFile,
    //       header: [
    //         { id: 'id', title: 'id' },
    //         { id: 'username', title: 'username' },
    //         { id: 'password', title: 'password' },
    //         { id: 'role', title: 'role' },
    //         { id: 'phone', title: 'phone' },
    //         { id: 'email', title: 'email' },
    //         { id: 'confirmation', title: 'confirmation' },
    //         { id: 'transport', title: 'transport' },
    //         { id: 'participants', title: 'participants' },
    //       ],
    //       alwaysQuote: true,
    //     });
      
    //     await csvWriter.writeRecords(users);
    // },
    // async getUserByName(username) {
    //     const users = await db.readUsersFromCSV(csvFile);
    //     const userIndex = users.findIndex((user) => user.username === username);
      
    //     if (userIndex === -1) {
    //       throw new Error(`User ${username} not found`);
    //     }
      
    //     return users[userIndex];
    // }
      
}