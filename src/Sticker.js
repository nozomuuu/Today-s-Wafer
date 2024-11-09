import React, { memo } from 'react';

// Stickerコンポーネント
const Sticker = memo(({ src, alt }) => (
  <img src={src} loading="lazy" alt={alt} className="sticker-image" />
));

export default Sticker;
