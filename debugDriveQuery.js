require('dotenv').config({ path: '.env.server' }); // 環境変数をロード
const { google } = require('googleapis');
const fs = require('fs');

// OAuth2クライアントの設定
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// トークンを読み込む
const tokenPath = 'token.json'; // token.jsonのパス
if (!fs.existsSync(tokenPath)) {
  console.error('token.json ファイルが存在しません。認証を実行してください。');
  process.exit(1);
}
const token = JSON.parse(fs.readFileSync(tokenPath));
oauth2Client.setCredentials(token);

// Drive APIクエリをテスト
const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function listFilesInFolder() {
  try {
    const folderId = process.env.FOLDER_ID;
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='image/webp' and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });
    console.log('Drive API クエリ結果:', response.data.files);
  } catch (error) {
    console.error('Drive API クエリ中のエラー:', error.message);
  }
}

listFilesInFolder();
