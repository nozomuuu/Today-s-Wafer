import React from 'react';
import { getStickerUrl } from './stickerImages';

const stickers = [
  'sticker1.webp',
  'sticker2.webp',
  'sticker3.webp',
  'sticker4.webp',
  // 必要に応じて他のステッカー名を追加
];

const StickerGallery = () => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '16px'
    }}
  >
    {stickers.map((stickerName) => {
      const stickerUrl = getStickerUrl(stickerName);
      if (!stickerUrl) return null;

      return (
        <div
          key={stickerName}
          style={{
            border: '1px solid #ccc',
            padding: '8px',
            textAlign: 'center',
            borderRadius: '8px'
          }}
        >
          <img
            src={stickerUrl}
            alt={stickerName}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '4px'
            }}
          />
          <p>{stickerName}</p>
        </div>
      );
    })}
  </div>
);

export default StickerGallery;
