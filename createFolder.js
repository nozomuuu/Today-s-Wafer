require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// トークンの読み込み
const tokenPath = path.join(__dirname, 'token.json');
if (!fs.existsSync(tokenPath)) {
  console.error(
    '❌ トークンが見つかりません。先に getRefreshToken.js を実行してください。'
  );
  process.exit(1);
}

// OAuth2クライアント初期化
const credentials = require('./credentials.json');

const tokens = require(tokenPath);
const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);
oauth2Client.setCredentials(tokens);

// Google Drive API クライアントを初期化
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// フォルダを作成
async function createFolder(folderName) {
  console.log(`📂 フォルダを作成しています: ${folderName}`);
  try {
    const response = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    console.log('✅ フォルダが正常に作成されました:', response.data);
  } catch (err) {
    console.error(
      '❌ フォルダ作成中にエラーが発生しました:',
      err.response?.data || err.message
    );
  }
}

// 実行
createFolder('テストフォルダ');
