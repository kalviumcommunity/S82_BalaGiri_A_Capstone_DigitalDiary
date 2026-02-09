export const DB_NAME = 'DiaryCryptoDB';
export const STORE_NAME = 'keys';
export const DB_VERSION = 1;

/**
 * Opens the IndexedDB database
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);

        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

/**
 * Stores the Encrypted Private Key for the current user
 * @param {string} userId - The unique user identifier
 * @param {object} keyData - { encryptedPrivateKey, salt, iv }
 */
export const storePrivateKey = async (userId, keyData) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: userId, ...keyData });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Error storing key');
    });
};

/**
 * Retrieves the Encrypted Private Key for the current user
 */
export const getPrivateKey = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userId);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = () => reject('Error retrieving key');
    });
};

/**
 * Clears keys (e.g., on logout)
 */
export const clearKeys = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(userId);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Error clearing key');
    });
};
