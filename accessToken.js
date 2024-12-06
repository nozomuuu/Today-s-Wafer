require('dotenv').config({ path: '.env.server' });
const { google } = require('googleapis');
require('dotenv').config({ path: './.env.server' });

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI // 環境変数からリダイレクトURIを取得
);
