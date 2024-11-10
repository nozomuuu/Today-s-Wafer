// IndexedDBHelper.js
export async function getStorageItem(key) {
    try {
        const value = await getFromIndexedDB(key);
        return value !== undefined ? JSON.parse(value) : JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error('IndexedDB and localStorage access failed:', error);
        return null;
    }
}

export async function setStorageItem(key, value) {
    try {
        await saveToIndexedDB(key, JSON.stringify(value));
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to save to IndexedDB or localStorage:', error);
    }
}

// IndexedDB操作関数の実装例
export async function getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AppDatabase", 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(["AppStore"], "readonly");
            const objectStore = transaction.objectStore("AppStore");
            const getRequest = objectStore.get(key);

            getRequest.onsuccess = function() {
                resolve(getRequest.result);
            };
            getRequest.onerror = function() {
                reject("Failed to retrieve data from IndexedDB");
            };
        };

        request.onerror = function() {
            reject("Failed to open IndexedDB");
        };
    });
}

export async function saveToIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AppDatabase", 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("AppStore")) {
                db.createObjectStore("AppStore");
            }
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(["AppStore"], "readwrite");
            const objectStore = transaction.objectStore("AppStore");
            const putRequest = objectStore.put(value, key);

            putRequest.onsuccess = function() {
                resolve();
            };
            putRequest.onerror = function() {
                reject("Failed to save data to IndexedDB");
            };
        };

        request.onerror = function() {
            reject("Failed to open IndexedDB");
        };
    });
}
