require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// トークンファイルのパス
const tokenPath = path.join(__dirname, 'token.json');

// トークンの更新処理
async function refreshAccessToken() {
  try {
    // 既存のトークンを読み込む
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oauth2Client.setCredentials(tokenData);

    // トークンをリフレッシュ
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('✅ 新しいアクセストークンを取得しました:', credentials);

    // トークンを更新して保存
    fs.writeFileSync(tokenPath, JSON.stringify(credentials, null, 2));
    console.log('✅ トークンを更新しました:', tokenPath);
  } catch (error) {
    console.error('❌ トークン更新中にエラーが発生しました:', error.message);
  }
}

// トークンをリフレッシュ
refreshAccessToken();
