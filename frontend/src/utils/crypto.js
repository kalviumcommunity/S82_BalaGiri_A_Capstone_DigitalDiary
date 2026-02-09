/**
 * Web Crypto API Utilities for End-to-End Encryption
 * Uses RSA-OAEP for key wrapping and AES-GCM for content encryption.
 */

// Configuration
const PBKDF2_ITERATIONS = 300000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const RSA_MODULUS_LENGTH = 4096;
const RSA_HASH = 'SHA-256';

/**
 * Converts ArrayBuffer to Base64 String
 */
export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Converts Base64 String to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Generates a random salt
 */
export const generateSalt = () => {
    return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
};

/**
 * Generates an RSA-OAEP Key Pair (Public/Private)
 * Returns { publicKey, privateKey } as CryptoKey objects
 */
export const generateKeyPair = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: RSA_MODULUS_LENGTH,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: RSA_HASH,
        },
        true, // extractable
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
};

/**
 * Derives a valid AES-GCM key from a user password and salt
 */
export const deriveKeyFromPassword = async (password, saltBuffer) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true, // extractable
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
};

/**
 * Generates a random AES-256 key for entry encryption
 */
export const generateAESKey = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
};

/**
 * Encrypts data (string or ArrayBuffer) using AES-GCM
 * Returns { encryptedData, iv } (both as ArrayBuffer)
 */
export const encryptData = async (data, key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    let dataBuffer;

    if (typeof data === 'string') {
        const enc = new TextEncoder();
        dataBuffer = enc.encode(data);
    } else {
        dataBuffer = data;
    }

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        dataBuffer
    );

    return { encryptedData: encrypted, iv: iv.buffer };
};

/**
 * Decrypts data using AES-GCM
 * Returns ArrayBuffer (or string if specified)
 */
export const decryptData = async (encryptedData, iv, key, isString = true) => {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv), // Make sure IV is Uint8Array
        },
        key,
        encryptedData
    );

    if (isString) {
        const dec = new TextDecoder();
        return dec.decode(decrypted);
    }
    return decrypted;
};

/**
 * Encrypts a File object (Blob) -> Returns Blob (IV + Encrypted Data)
 */
export const encryptFile = async (file, key) => {
    const buffer = await file.arrayBuffer();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        buffer
    );

    // Combine IV and Encrypted Data
    return new Blob([iv, encrypted]);
};

/**
 * Decrypts a Blob (IV + Encrypted Data) -> Returns Blob (original file)
 */
export const decryptFile = async (encryptedBlob, key, mimeType) => {
    const buffer = await encryptedBlob.arrayBuffer();

    // Extract IV (first 12 bytes)
    const iv = buffer.slice(0, IV_LENGTH);
    const data = buffer.slice(IV_LENGTH);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
        },
        key,
        data
    );

    return new Blob([decrypted], { type: mimeType });
};

/**
 * Wraps (encrypts) an AES key with an RSA Public Key
 */
export const wrapAESKey = async (aesKey, publicKey) => {
    return await window.crypto.subtle.wrapKey(
        "raw",
        aesKey,
        publicKey,
        {
            name: "RSA-OAEP",
        }
    );
};

/**
 * Unwraps (decrypts) an AES key with an RSA Private Key
 */
export const unwrapAESKey = async (wrappedKey, privateKey) => {
    return await window.crypto.subtle.unwrapKey(
        "raw",
        wrappedKey,
        privateKey,
        {
            name: "RSA-OAEP",
        },
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
};

/**
 * Exports a key to JWK format (for storage)
 */
export const exportKeyToJWK = async (key) => {
    return await window.crypto.subtle.exportKey("jwk", key);
};

/**
 * Imports a key from JWK format
 */
export const importKeyFromJWK = async (jwk, type) => {
    const algorithm = type === 'public' || type === 'private'
        ? { name: "RSA-OAEP", hash: RSA_HASH }
        : { name: "AES-GCM" };

    const keyUsages = type === 'public'
        ? ["encrypt", "wrapKey"]
        : type === 'private'
            ? ["decrypt", "unwrapKey"]
            : ["encrypt", "decrypt"];

    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        algorithm,
        true,
        keyUsages
    );
};

/**
 * Encrypts a Private Key (CryptoKey) with a password
 * Returns { encryptedPrivateKey (Base64), salt (Base64), iv (Base64) }
 */
export const encryptPrivateKey = async (privateKey, password) => {
    // 1. Export Private Key to JWK
    const jwk = await exportKeyToJWK(privateKey);
    const jwkString = JSON.stringify(jwk);

    // 2. Generate Salt
    const salt = generateSalt();

    // 3. Derive Key from Password
    const key = await deriveKeyFromPassword(password, salt);

    // 4. Encrypt JWK String
    const { encryptedData, iv } = await encryptData(jwkString, key);

    return {
        encryptedPrivateKey: arrayBufferToBase64(encryptedData),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv)
    };
};

/**
 * Decrypts a Private Key with a password
 * Returns Private Key (CryptoKey)
 */
export const decryptPrivateKey = async (encryptedPrivateKeyB64, password, saltB64, ivB64) => {
    // 1. Convert Base64 helpers
    const salt = base64ToArrayBuffer(saltB64);
    const iv = base64ToArrayBuffer(ivB64);
    const encryptedData = base64ToArrayBuffer(encryptedPrivateKeyB64);

    // 2. Derive Key from Password
    const key = await deriveKeyFromPassword(password, salt);

    // 3. Decrypt
    const jwkString = await decryptData(encryptedData, iv, key, true);

    // 4. Import JWK
    const jwk = JSON.parse(jwkString);
    return await importKeyFromJWK(jwk, 'private');
};
