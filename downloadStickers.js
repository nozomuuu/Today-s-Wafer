const fs = require('fs');
const axios = require('axios');
const path = require('path');

// API URL とダウンロード先
const API_URL = 'http://127.0.0.1:5005/get-stickers';
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const REPORT_FILE = path.join(__dirname, 'report.log');

// フォルダ作成関数（再利用可能）
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folderPath}`);
  }
};

// ステッカーをダウンロードする関数（再試行対応）
const downloadStickerWithRetry = async (url, filename, retries = 3) => {
  const filePath = path.join(DOWNLOAD_DIR, filename);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        maxRedirects: 5,
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded: ${filename}`);
      return { filename, success: true }; // 成功時に結果を返す
    } catch (err) {
      console.error(
        `Attempt ${attempt} failed for ${filename}: ${err.message}`
      );
      if (attempt === retries) {
        return { filename, success: false, error: err.message }; // 失敗時にエラーを返す
      }
    }
  }
};

// レポート生成関数
const generateReport = (results) => {
  const success = results.filter((r) => r.success).map((r) => r.filename);
  const failures = results.filter((r) => !r.success);

  console.log('\nDownload Summary:');
  console.log(`- Success: ${success.length}`);
  console.log(`- Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.log(`Failed Files: ${failures.map((r) => r.filename).join(', ')}`);
  }

  // レポートファイルに出力
  const reportContent = [
    `Download Report - ${new Date().toLocaleString()}`,
    `\nSuccessful Downloads (${success.length}):`,
    ...success,
    `\nFailed Downloads (${failures.length}):`,
    ...failures.map((r) => `${r.filename} - Error: ${r.error}`),
  ].join('\n');

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report saved to ${REPORT_FILE}`);
};

// メイン処理
const main = async () => {
  console.log('Fetching sticker data from API...');
  createFolder(DOWNLOAD_DIR);

  try {
    const response = await axios.get(API_URL);
    const stickers = response.data;

    if (!stickers || !stickers.length) {
      console.log('No stickers found.');
      return;
    }

    console.log(`Found ${stickers.length} stickers. Starting download...`);

    let completed = 0;
    const total = stickers.length;

    const downloadPromises = stickers.map(async (sticker) => {
      const { webContentLink: url, name: filename } = sticker;

      try {
        const result = await downloadStickerWithRetry(url, filename);
        if (result.success) {
          completed++;
          console.log(`Progress: ${completed}/${total}`);
        }
        return result;
      } catch (err) {
        console.error(
          `Unexpected error downloading ${filename}: ${err.message}`
        );
        return { filename, success: false, error: err.message };
      }
    });

    const results = await Promise.all(downloadPromises);

    // レポート生成
    generateReport(results);

    console.log(
      `\nFinal Status: Completed ${completed}/${total} successfully. Check report for details.`
    );
  } catch (err) {
    console.error('Error fetching stickers:', err.message);
  }
};

// 実行
main();
