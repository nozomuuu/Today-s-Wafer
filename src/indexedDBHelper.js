import { openDB } from 'idb';

const DB_NAME = 'StickerDB';
const STORE_NAME = 'stickers';

const initDB = async () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    }
  });

export const saveStickerToIndexedDB = async (sticker) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).add(sticker);
    await tx.done;
    // console.info('Sticker saved to IndexedDB:', sticker); // デバッグ情報を削除
  } catch (error) {
    console.error('Failed to save sticker to IndexedDB:', error);
  }
};

export const getCollectedStickers = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const stickers = await tx.objectStore(STORE_NAME).getAll();
    await tx.done;
    return stickers;
  } catch (error) {
    console.error('Failed to load stickers from IndexedDB:', error);
    return [];
  }
};

export const deleteStickerFromIndexedDB = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).delete(id);
    await tx.done;
  } catch (error) {
    console.error('Failed to delete sticker from IndexedDB:', error);
  }
};

export const clearAllStickers = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.done;
  } catch (error) {
    console.error('Failed to clear stickers from IndexedDB:', error);
  }
};
