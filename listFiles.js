const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// トークンファイルのパス
const tokenPath = path.join(__dirname, 'token.json');
const credentials = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

// OAuth2クライアントの設定
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(credentials);

// Google Drive APIのインスタンスを作成
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// ファイルリストを取得
async function listFiles() {
  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name)',
    });
    console.log('📂 ファイル一覧:');
    res.data.files.forEach((file) => {
      console.log(`${file.name} (${file.id})`);
    });
  } catch (err) {
    console.error('❌ ファイル一覧取得中にエラー:', err.message);
  }
}

listFiles();
