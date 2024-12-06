require('dotenv').config({ path: '.env.server' });
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const winston = require('winston');
const fetch = require('node-fetch');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5005;

// ロガー設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
    new winston.transports.Console(),
  ],
});

// CORS設定
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000'];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

// OAuth2クライアント初期化
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// トークンの読み込みとセット
const loadToken = () => {
  try {
    if (fs.existsSync('token.json')) {
      const token = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
      oauth2Client.setCredentials(token);
      logger.info('Existing token loaded from token.json');
    } else {
      logger.warn('No token.json found; authentication required.');
    }
  } catch (error) {
    logger.error('Error loading token.json:', {
      message: error.message,
      stack: error.stack,
    });
  }
};

loadToken();

// Google Drive API インスタンス作成
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// ヘルスチェックエンドポイント
app.get('/health-check', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// 認証用エンドポイント
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code', // 必須パラメータを明示的に追加
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  logger.info(`Redirecting user to Google OAuth2 consent page: ${authUrl}`);
  res.redirect(authUrl);
});

// OAuth2コールバックエンドポイント
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    logger.error('No code parameter found in OAuth2 callback');
    return res
      .status(400)
      .send(
        '<h1>Error</h1><p>Authorization code is missing. Please try again.</p>'
      );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
    logger.info('New token obtained and saved to token.json');
    res.send(
      '<h1>Authentication successful</h1><p>You can now close this tab and return to the application.</p>'
    );
  } catch (error) {
    logger.error('Error retrieving OAuth2 tokens:', {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .send(
        '<h1>Authentication failed</h1><p>There was an error during the authentication process.</p>'
      );
  }
});

// プロキシで画像を取得するエンドポイント
app.get('/proxy-image', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    logger.warn('Missing "id" query parameter in /proxy-image');
    return res
      .status(400)
      .json({ success: false, error: 'Image ID is required' });
  }

  const url = `https://drive.google.com/uc?id=${id}`;
  logger.info(`Proxying image request for ID: ${id}`);

  try {
    let finalUrl = url;
    let response;
    const redirectChain = [];

    const MAX_REDIRECTS = 5;

    for (let i = 0; i < MAX_REDIRECTS; i++) {
      response = await fetch(finalUrl, { redirect: 'manual' });
      redirectChain.push({ status: response.status, url: finalUrl });

      if (response.status === 303 || response.status === 302) {
        const redirectUrl = response.headers.get('location');
        if (!redirectUrl) {
          logger.error(`Redirection failed. No location header for ID: ${id}`);
          return res.status(500).json({
            success: false,
            error: 'Redirection failed. No location header.',
          });
        }
        logger.info(`Redirecting to: ${redirectUrl}`);
        finalUrl = redirectUrl;
      } else {
        break;
      }
    }

    logger.info('Redirection chain:', redirectChain);

    if (!response.ok) {
      logger.error(
        `Failed to fetch image. Status: ${response.status} for ID: ${id}`
      );
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch image. Status: ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      logger.error(`Invalid content type: ${contentType} for ID: ${id}`);
      return res
        .status(400)
        .json({ success: false, error: 'Invalid image content' });
    }

    res.set('Content-Type', contentType);
    response.body.pipe(res).on('error', (error) => {
      logger.error('Error streaming response body:', error);
      res
        .status(500)
        .json({ success: false, error: 'Error streaming response body' });
    });
  } catch (error) {
    logger.error(`Error in /proxy-image API for ID: ${id}`, {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ success: false, error: 'Server error while fetching image' });
  }
});

// サーバー起動
const server = app.listen(PORT, '127.0.0.1', () => {
  logger.info(`Server running at http://127.0.0.1:${PORT}/`);
  exec(`lsof -i :${PORT}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Error checking port usage: ${stderr}`);
      return;
    }
    logger.info(`Port ${PORT} status:\n${stdout}`);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(
      `Port ${PORT} is already in use. Ensure no other process is using it.`
    );
    process.exit(1);
  } else {
    throw error;
  }
});

process.on('SIGINT', () => {
  logger.info('Server shutting down...');
  server.close(() => {
    logger.info('Server successfully shut down');
    process.exit(0);
  });
});
