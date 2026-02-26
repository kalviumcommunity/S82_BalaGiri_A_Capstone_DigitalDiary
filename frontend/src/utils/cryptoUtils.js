const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const HASH_ALGO = "SHA-256";



export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export const generateSalt = () => {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    return arrayBufferToBase64(salt);
};

export const generateIV = () => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    return arrayBufferToBase64(iv);
};



export const derivePasswordKey = async (password, saltBase64) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: base64ToArrayBuffer(saltBase64),
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGO
        },
        keyMaterial,
        { name: "AES-GCM", length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
};

export const generateMasterKey = async () => {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: KEY_LENGTH
        },
        true,
        ["encrypt", "decrypt"]
    );
};

export const exportAndEncryptMasterKey = async (masterKey, passwordKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const rawMK = await window.crypto.subtle.exportKey("raw", masterKey);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        passwordKey,
        rawMK
    );

    return {
        encryptedMasterKey: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv)
    };
};

export const encryptMasterKey = async (masterKeyRaw, passwordKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        passwordKey,
        masterKeyRaw
    );

    return {
        encryptedMasterKey: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv)
    };
};

export const decryptMasterKey = async (passwordKey, encryptedMasterKeyB64, ivB64) => {
    try {
        const encryptedBuffer = base64ToArrayBuffer(encryptedMasterKeyB64);
        const iv = base64ToArrayBuffer(ivB64);

        const rawMK = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            passwordKey,
            encryptedBuffer
        );

        return window.crypto.subtle.importKey(
            "raw",
            rawMK,
            { name: "AES-GCM", length: KEY_LENGTH },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (e) {
        // console.error("Master Key Decryption Failed", e);
        throw new Error("Incorrect password or corrupted key.");
    }
};

// Derives the Auth Token from the password.
// This is a separate hash used ONLY for authentication with the backend.
// Ensures the backend never sees the password used for encryption.
export const deriveEncryptionKey = async (password) => {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "HMAC", hash: HASH_ALGO },
        false,
        ["sign"]
    );

    const signature = await window.crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode("AUTH_PURPOSE_SEPARATION_TOKEN")
    );

    return arrayBufferToBase64(signature);
};




export const deriveEntryKey = async (masterKey, entrySaltBase64) => {

    return window.crypto.subtle.deriveKey(
        {
            name: "HKDF",
            salt: base64ToArrayBuffer(entrySaltBase64),
            info: new TextEncoder().encode("DiaryEntry"),
            hash: HASH_ALGO
        },
        masterKey,
        { name: "AES-GCM", length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
    );
};


export const decryptMasterKeyForHKDF = async (passwordKey, encryptedMasterKeyB64, ivB64) => {
    const encryptedBuffer = base64ToArrayBuffer(encryptedMasterKeyB64);
    const iv = base64ToArrayBuffer(ivB64);

    const rawMK = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        passwordKey,
        encryptedBuffer
    );

    return window.crypto.subtle.importKey(
        "raw",
        rawMK,
        { name: "HKDF" },
        false,
        ["deriveKey"]
    );
};

export const generateMasterKeyHKDF = async () => {
    const keyMaterial = window.crypto.getRandomValues(new Uint8Array(32));

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyMaterial,
        { name: "HKDF" },
        false,
        ["deriveKey", "deriveBits"]
    );

    return { masterKey: key, keyMaterial };
};




export const encryptWithKey = async (content, key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const enc = new TextEncoder();

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(content)
    );

    return {
        ciphertext: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv)
    };
};

export const decryptWithKey = async (ciphertextB64, ivB64, key) => {
    const iv = base64ToArrayBuffer(ivB64);
    const ciphertext = base64ToArrayBuffer(ciphertextB64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
};



export const encryptFileWithKey = async (file, key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const fileBuffer = await file.arrayBuffer();

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        fileBuffer
    );

    return {
        encryptedBlob: new Blob([encryptedBuffer]),
        iv: arrayBufferToBase64(iv)
    };
};

export const decryptFileWithKey = async (encryptedBlob, ivB64, key, mimeType) => {
    const iv = base64ToArrayBuffer(ivB64);
    const encryptedBuffer = await encryptedBlob.arrayBuffer();

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        encryptedBuffer
    );

    return new Blob([decryptedBuffer], { type: mimeType });
};



export const createValidator = async (masterKey) => {
    const validatorSalt = generateSalt();
    const validatorKey = await deriveEntryKey(masterKey, validatorSalt);
    const { ciphertext, iv } = await encryptWithKey("VALID_PASSWORD_CHECK", validatorKey);

    return `${validatorSalt}:${iv}:${ciphertext}`;
};

export const checkValidator = async (validatorStr, masterKey) => {
    try {
        const [salt, iv, ciphertext] = validatorStr.split(":");
        if (!salt || !iv || !ciphertext) return false;

        const validatorKey = await deriveEntryKey(masterKey, salt);
        const decrypted = await decryptWithKey(ciphertext, iv, validatorKey);

        return decrypted === "VALID_PASSWORD_CHECK";
    } catch (e) {
        return false;
    }
};



export const encryptEntryPayload = async (entryData, key) => {
    // Ensure strict string types for mood to avoid object serialization issues
    // STRICT payload structure enforcement:
    const payload = {
        title: String(entryData.title || ""),
        content: String(entryData.content || ""),
        mood: typeof entryData.mood === "string" ? entryData.mood : ""
    };

    // Explicitly encode the JSON string
    // Use TextEncoder to ensure consistent byte representation
    const jsonString = JSON.stringify(payload);
    const enc = new TextEncoder();
    const encodedPayload = enc.encode(jsonString);

    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedPayload
    );

    return {
        payload: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv)
    };
};

export const decryptEntryPayload = async (payload, ivB64, key, entryId) => {
    try {
        const iv = base64ToArrayBuffer(ivB64);
        const ciphertext = base64ToArrayBuffer(payload);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            key,
            ciphertext
        );

        const dec = new TextDecoder();
        const jsonString = dec.decode(decryptedBuffer);
        return JSON.parse(jsonString);

    } catch (e) {
        // Return corrupted flag with ID instead of throwing
        return { corrupted: true, id: entryId };
    }
};

