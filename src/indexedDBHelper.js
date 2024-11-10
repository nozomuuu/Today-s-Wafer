// indexedDBHelper.js
let db;
const dbName = 'stickerAppDB';
const dbVersion = 2; // バージョン番号を更新してデータベースを再構築

export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('stickers')) {
                db.createObjectStore('stickers', { keyPath: 'id', autoIncrement: true });
            }
            console.log('Object store "stickers" created or verified.');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Database failed to open:', event.target.error);
            reject(event.target.error);
        };
    });
}

export function saveSticker(sticker) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stickers'], 'readwrite');
        const store = transaction.objectStore('stickers');
        const request = store.add(sticker);

        request.onsuccess = () => {
            console.log('Sticker saved to IndexedDB');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Failed to save sticker:', event.target.error);
            reject(event.target.error);
        };
    });
}

export function getStickers() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stickers'], 'readonly');
        const store = transaction.objectStore('stickers');
        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('Failed to retrieve stickers:', event.target.error);
            reject(event.target.error);
        };
    });
}
