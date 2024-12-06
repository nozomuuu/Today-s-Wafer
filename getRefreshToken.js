require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// スコープ設定
const SCOPES = ['https://www.googleapis.com/auth/drive']; // 読み書き権限

// OAuth2クライアント初期化
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 認証URL生成
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

// 認証プロンプト
console.log('\n==============================================');
console.log('1. 以下のURLをブラウザで開いてアプリを認証してください:');
console.log(`\n${authUrl}\n`);
console.log('==============================================\n');

// 認証コードを受け取る
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  '2. ブラウザで認証後、表示されたコードをここに貼り付けてください: ',
  async (code) => {
    rl.close();
    try {
      console.log(
        '\n認証コードを受信しました。トークン取得処理を開始します...\n'
      );

      // トークン取得
      const { tokens } = await oauth2Client.getToken(code);
      console.log('✅ トークン取得に成功しました:', tokens);

      // トークン保存
      const tokenPath = path.join(__dirname, 'token.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      console.log('\n==============================================');
      console.log(`✅ トークンが正常に保存されました: ${tokenPath}`);
      console.log('==============================================\n');
    } catch (err) {
      console.error('\n==============================================');
      console.error('❌ トークン生成中にエラーが発生しました:', err.message);
      console.error('==============================================\n');
    }
  }
);
