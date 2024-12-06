require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// 必要な環境変数のチェック
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDIRECT_URI',
  'FOLDER_ID',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 環境変数 ${envVar} が設定されていません。`);
    process.exit(1);
  }
}

// OAuth2クライアントの設定
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// トークンファイルの読み込み
const tokenPath = path.join(__dirname, 'token.json');
if (!fs.existsSync(tokenPath)) {
  console.error(
    '❌ トークンファイルが見つかりません。getRefreshToken.js を実行してください。'
  );
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
oauth2Client.setCredentials(credentials);

// トークンの有効性を確認
async function ensureValidToken() {
  if (
    !credentials.expiry_date ||
    new Date().getTime() > credentials.expiry_date
  ) {
    console.log('🔄 トークンが期限切れです。リフレッシュを実行します...');
    const { credentials: newTokens } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(newTokens);
    fs.writeFileSync(tokenPath, JSON.stringify(newTokens, null, 2));
    console.log('✅ トークンが更新されました。');
  }
}

// Google Drive APIのインスタンスを作成
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// アップロード対象のファイル
const filePath = process.argv[2] || path.join(__dirname, 'upload_sample.txt');
const folderId = process.argv[3] || process.env.FOLDER_ID;

if (!fs.existsSync(filePath)) {
  console.error(`❌ ファイルが見つかりません: ${filePath}`);
  process.exit(1);
}

if (!folderId) {
  console.error('❌ フォルダIDが指定されていません。');
  process.exit(1);
}

// アップロード関数
async function uploadFile() {
  try {
    await ensureValidToken(); // トークンの有効性を確認
    console.log(`⬆️ アップロード中: ${filePath}`);

    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId], // アップロード先フォルダ
    };

    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(filePath).on('data', (chunk) => {
        console.log(`⬆️ アップロード中: ${chunk.length}バイト転送`);
      }),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    // 詳細なログを出力
    console.log(`✅ アップロード完了: 
            ファイル名: ${path.basename(filePath)} 
            ファイルID: ${res.data.id} 
            フォルダID: ${folderId}`);

    // ファイルとフォルダへのリンクを表示
    const fileLink = `https://drive.google.com/file/d/${res.data.id}/view?usp=sharing`;
    const folderLink = `https://drive.google.com/drive/folders/${folderId}`;
    console.log(`📂 アップロードされたファイルへのリンク: ${fileLink}`);
    console.log(`📂 アップロード先フォルダへのリンク: ${folderLink}`);
  } catch (err) {
    console.error('❌ アップロード中にエラーが発生しました:', err.message);
    if (err.response?.data) {
      console.error('エラー詳細:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

uploadFile();
