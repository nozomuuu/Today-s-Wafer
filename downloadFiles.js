require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// トークンファイルの読み込み
const tokenPath = path.join(__dirname, 'token.json');
const credentials = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

// OAuth2クライアントの設定
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(credentials);

// Google Drive APIのインスタンスを作成
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// 環境変数からフォルダIDを取得
const folderId = process.env.FOLDER_ID;
if (!folderId) {
  console.error('❌ 環境変数 FOLDER_ID が設定されていません。');
  process.exit(1);
}

async function downloadFiles() {
  try {
    console.log(`📂 フォルダID: ${folderId} のファイルを取得します...`);

    // フォルダ内のファイルを取得
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });

    const { files } = res.data;
    if (!files || files.length === 0) {
      console.log('❌ フォルダ内にファイルが見つかりませんでした。');
      return;
    }

    console.log('📂 フォルダ内のファイルをダウンロードします:');
    for (const file of files) {
      console.log(`⬇️ ダウンロード中: ${file.name}`);
      const dest = fs.createWriteStream(path.join(__dirname, file.name));
      const result = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'stream' }
      );
      await new Promise((resolve, reject) => {
        result.data
          .on('end', () => {
            console.log(`✅ ダウンロード完了: ${file.name}`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`❌ ダウンロード失敗: ${file.name} - ${err.message}`);
            reject(err);
          })
          .pipe(dest);
      });
    }
  } catch (err) {
    console.error('❌ ダウンロード中にエラーが発生しました:', err.message);
    if (err.response?.data) {
      console.error('エラー詳細:', err.response.data);
    }
  }
}

// ダウンロード実行
downloadFiles();
