const axios = require('axios');
require('dotenv').config({ path: './.env.server' });

const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

async function fetchDriveFiles() {
  try {
    const response = await axios.get(DRIVE_API_URL, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        pageSize: 10,
        fields: 'files(id, name)',
      },
    });

    console.log('Files from Google Drive:');
    response.data.files.forEach((file) => {
      console.log(`ID: ${file.id}, Name: ${file.name}`);
    });
  } catch (error) {
    console.error(
      'Error fetching files from Google Drive:',
      error.response?.data || error.message
    );
  }
}

fetchDriveFiles();
