// indexedDBWorker.js
import { saveStickerToIndexedDB, getCollectedStickers } from './indexedDBHelper';

self.onmessage = async (event) => {
  const { type, sticker } = event.data;
  if (type === 'save') {
    await saveStickerToIndexedDB(sticker);
    self.postMessage({ type: 'saveComplete', sticker });
  } else if (type === 'load') {
    const stickers = await getCollectedStickers();
    self.postMessage({ type: 'loadComplete', stickers });
  }
};
