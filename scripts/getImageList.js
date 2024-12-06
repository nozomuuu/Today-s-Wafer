const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  keyFile: 'top-vial-442320-t0-4845cc4d8d3e.json', // サービスアカウントキーのファイルパス
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

async function listFiles() {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const folderId = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('FOLDER_ID is not set in .env');
    }

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='image/webp'`,
      fields: 'files(id, name)'
    });

    const files = res.data.files;
    if (files.length === 0) {
      console.log('No files found.');
      return;
    }

    const imageList = files.map(file => ({
      id: file.id,
      name: file.name
    }));

    fs.writeFileSync('./stickerImages.json', JSON.stringify(imageList, null, 2));
    console.log('Image list saved to stickerImages.json');
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}

listFiles();
