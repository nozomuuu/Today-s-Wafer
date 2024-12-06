import stickerData from './stickerImages.json';

const GOOGLE_DRIVE_BASE_URL = "https://drive.google.com/uc?export=view&id=";

// Sticker URLを取得する関数
export const getStickerUrl = (stickerName) => {
  const sticker = stickerData.find((sticker) => sticker.name === stickerName);
  if (!sticker) {
    console.error(`Sticker with name ${stickerName} not found.`);
    return null;
  }
  return `${GOOGLE_DRIVE_BASE_URL}${sticker.id}`;
};

// デフォルトエクスポートとして全データを提供
export default stickerData.map((sticker) => ({
  ...sticker,
  url: `${GOOGLE_DRIVE_BASE_URL}${sticker.id}`
}));
