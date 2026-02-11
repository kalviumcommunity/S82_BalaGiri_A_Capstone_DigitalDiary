/**
 * Web Crypto API Utilities for Zero-Knowledge End-to-End Encryption
 * 
 * Architecture:
 * 1. Master Key (MK) = PBKDF2(Password, UserSalt, 600k iter)
 * 2. Auth Token = HMAC(Password, "AUTH_PURPOSE") -> Sent to server
 * 3. Entry Key (EK) = HKDF(MK, EntrySalt, "DiaryEntry-AES-GCM-v1")
 * 4. Content Encryption = AES-GCM(EK, Plaintext)
 * 
 * SECURITY NOTE:
 * The Master Key MUST NEVER be sent to the server or stored in localStorage.
 * It exists only in memory (Closure/Context) and is derived on demand.
 */

// Configuration
const PBKDF2_ITERATIONS = 600000; // High iteration count for security
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const MASTER_KEY_LENGTH = 256;
const HASH_ALGO = "SHA-256";

// ... Base64 Helpers ...
export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
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

// ... Key Derivation ...

export const deriveMasterKey = async (password, userSaltBase64) => {
    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const saltBuffer = base64ToArrayBuffer(userSaltBase64);

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGO
        },
        passwordKey,
        { name: "HMAC", hash: HASH_ALGO, length: MASTER_KEY_LENGTH },
        false,
        ["sign"]
    );
};

export const deriveAuthToken = async (password) => {
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
    const enc = new TextEncoder();
    const saltBuffer = base64ToArrayBuffer(entrySaltBase64);
    const infoBuffer = enc.encode("DiaryEntry-AES-GCM-v1");

    return window.crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: saltBuffer,
            info: infoBuffer
        },
        masterKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

// ... Encryption Primitives ...

/**
 * Encrypts generic string content with a given Key.
 * Returns { ciphertext, iv } (Base64)
 */
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

/**
 * Decrypts generic string content with a given Key and IV.
 */
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

// ... Higher Level Helpers (Optional, but kept for compatibility/convenience) ...

export const encryptEntry = async (content, masterKey) => {
    const entrySalt = generateSalt();
    const entryKey = await deriveEntryKey(masterKey, entrySalt);
    const { ciphertext, iv } = await encryptWithKey(content, entryKey);
    return { ciphertext, iv, entrySalt };
};

export const decryptEntry = async (ciphertextB64, ivB64, entrySaltB64, masterKey) => {
    try {
        const entryKey = await deriveEntryKey(masterKey, entrySaltB64);
        return await decryptWithKey(ciphertextB64, ivB64, entryKey);
    } catch (e) {
        console.error("Decryption Failed:", e);
        throw new Error("Failed to decrypt entry.");
    }
};

export const createValidator = async (masterKey) => {
    const CONSTANT = "VALID_PASSWORD_CHECK";
    const { ciphertext, iv, entrySalt } = await encryptEntry(CONSTANT, masterKey);
    return `${entrySalt}:${iv}:${ciphertext}`;
};

export const checkValidator = async (validatorStr, masterKey) => {
    try {
        const [entrySalt, iv, ciphertext] = validatorStr.split(":");
        if (!entrySalt || !iv || !ciphertext) return false;
        const decrypted = await decryptEntry(ciphertext, iv, entrySalt, masterKey);
        return decrypted === "VALID_PASSWORD_CHECK";
    } catch (e) {
        return false;
    }
};

// ... File Encryption ...

/**
 * Encrypts a File object (Blob) with a SPECIFIC key (used for multi-file with same entry key)
 */
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

/**
 * Legacy wrapper: generates new salt per file. 
 * Use encryptFileWithKey if sharing salt.
 */
export const encryptFile = async (file, masterKey) => {
    const entrySalt = generateSalt();
    const entryKey = await deriveEntryKey(masterKey, entrySalt);
    const { encryptedBlob, iv } = await encryptFileWithKey(file, entryKey);

    return { encryptedBlob, iv, entrySalt };
};

export const decryptFile = async (encryptedBlob, ivB64, entrySaltB64, masterKey, mimeType) => {
    const entryKey = await deriveEntryKey(masterKey, entrySaltB64);
    const iv = base64ToArrayBuffer(ivB64);
    const encryptedBuffer = await encryptedBlob.arrayBuffer();

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        entryKey,
        encryptedBuffer
    );

    return new Blob([decryptedBuffer], { type: mimeType });
}
