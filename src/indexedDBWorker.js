import {
  saveStickerToIndexedDB,
  getCollectedStickers,
  deleteStickerFromIndexedDB,
  clearAllStickers
} from './indexedDBHelper';

onmessage = async (event) => {
  const { type, sticker, id } = event.data;

  try {
    switch (type) {
      case 'save': {
        await saveStickerToIndexedDB(sticker);
        postMessage({ type: 'saveComplete', sticker });
        break;
      }
      case 'load': {
        const stickers = await getCollectedStickers();
        postMessage({ type: 'loadComplete', stickers });
        break;
      }
      case 'delete': {
        if (id) {
          await deleteStickerFromIndexedDB(id);
          postMessage({ type: 'deleteComplete', id });
        } else {
          throw new Error('ID is required for deletion.');
        }
        break;
      }
      case 'clear': {
        await clearAllStickers();
        postMessage({ type: 'clearComplete' });
        break;
      }
      default: {
        throw new Error('Unknown message type');
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: error.message });
  }
};
