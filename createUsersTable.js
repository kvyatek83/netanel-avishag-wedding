require('dotenv').config();
const fs = require('fs').promises;

const filePath = process.env.DATA_FILE || 'users.csv';
const initialData = 'id,username,hebrewname,password,role,phone,email,confirmation,transport,participants\n';

async function createFileAndInitializeData() {
  try {
    // Check if the file exists
    try {
      await fs.access(filePath);

      // If the file exists, log a message and return
      console.log('User file already exists:', filePath);
      return;
    } catch (err) {
      // File does not exist, continue creating it and initializing data
    }

    // Create the file and write the initial data
    await fs.writeFile(filePath, initialData, 'utf8');
    console.log('User file was created:', filePath);
  } catch (err) {
    console.error('Error creating or initializing the user file:', err);
  }
}

createFileAndInitializeData();
