const fs = require('fs');
const { google } = require('googleapis');

// credentials.json のパスを指定
const CREDENTIALS_PATH = './credentials.json';

// 認証クライアントの作成
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // トークンを取得またはリロード
  const TOKEN_PATH = 'token.json';
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile('token.json', JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', 'token.json');
      });
      callback(oAuth2Client);
    });
  });
}

function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list(
    {
      q: "1LV2apEIbG6pZU9btNLTBA4PKKWcDT", // Google DriveフォルダIDを指定
      pageSize: 100,
      fields: 'nextPageToken, files(id, name, mimeType, webContentLink)',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id}) - ${file.webContentLink}`);
        });
      } else {
        console.log('No files found.');
      }
    }
  );
}

fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listFiles);
});
