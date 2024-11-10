// indexedDBHelper.js
export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("StickerAppDB", 1);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject("Database failed to open");
        };

        request.onsuccess = () => {
            console.log("Database opened successfully");
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("stickers", { keyPath: "key" });
            console.log("Database setup complete");
        };
    });
}

export function saveToIndexedDB(key, data) {
    return openDatabase().then((db) => {
        const transaction = db.transaction(["stickers"], "readwrite");
        const store = transaction.objectStore("stickers");
        store.put({ key, data });
    });
}

export function getFromIndexedDB(key) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["stickers"], "readonly");
            const store = transaction.objectStore("stickers");
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.data : null);
            };

            request.onerror = (event) => {
                console.error("Database get error:", event.target.error);
                reject("Failed to retrieve data");
            };
        });
    });
}
