require('dotenv').config();
const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = {
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
    }
}