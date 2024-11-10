import { openDB } from 'idb';

const DB_NAME = 'StickerDB';
const STORE_NAME = 'stickers';

const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const saveStickerToIndexedDB = async (sticker) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).add(sticker);
    await tx.done;
    console.log('Sticker saved to IndexedDB');
};

export const getCollectedStickers = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const stickers = await tx.objectStore(STORE_NAME).getAll();
    await tx.done;
    console.log('Stickers loaded from IndexedDB:', stickers);
    return stickers;
};
