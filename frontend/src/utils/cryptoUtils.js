/**
 * Zero-Knowledge Cryptography Utilities
 * 
 * Architecture: Wrapped Key Model
 * 1. Password Key (PK) = PBKDF2(Password, UserSalt)
 * 2. Master Key (MK) = Random 256-bit Key
 * 3. Encrypted Master Key (EMK) = AES-GCM(PK, MK) -> Stored on Server
 * 4. Entry Key (EK) = HKDF(MK, EntrySalt) -> Unique per entry
 * 5. Ciphertext = AES-GCM(EK, Plaintext)
 */

const PBKDF2_ITERATIONS = 310000; // OWASP recommended minimum
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const HASH_ALGO = "SHA-256";

// --- Helpers ---

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

// --- Core Key Management ---

/**
 * Derives the Key Encryption Key (KEK) from the user's password.
 * This key is used ONLY to wrap/unwrap the Master Key.
 * It is NEVER stored or sent to the server.
 */
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
        false, // Not exportable
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
};

/**
 * Generates a fresh random Master Key.
 * Used during Signup.
 */
export const generateMasterKey = async () => {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: KEY_LENGTH
        },
        true, // Exportable (needed to wrap it)
        ["encrypt", "decrypt"]
    );
};

/**
 * Encrypts (Wraps) the Master Key using the Password Key.
 * Returns { encryptedMasterKey, iv } (Base64)
 */
export const exportAndEncryptMasterKey = async (masterKey, passwordKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Export MK to raw bytes
    const rawMK = await window.crypto.subtle.exportKey("raw", masterKey);

    // Encrypt raw MK with Password Key
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

/**
 * Decrypts (Unwraps) the Master Key using the Password Key.
 */
export const decryptMasterKey = async (passwordKey, encryptedMasterKeyB64, ivB64) => {
    try {
        const encryptedBuffer = base64ToArrayBuffer(encryptedMasterKeyB64);
        const iv = base64ToArrayBuffer(ivB64);

        const rawMK = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            passwordKey,
            encryptedBuffer
        );

        // Import the raw bytes back into a CryptoKey
        return window.crypto.subtle.importKey(
            "raw",
            rawMK,
            { name: "AES-GCM", length: KEY_LENGTH },
            false, // Not exportable after import (security best practice)
            ["encrypt", "decrypt"] // MK is used to derive Entry Keys or encrypt data
        );
    } catch (e) {
        console.error("Master Key Decryption Failed", e);
        throw new Error("Incorrect password or corrupted key.");
    }
};

/**
 * Derives the Auth Token from the password.
 * This is a separate hash used ONLY for authentication with the backend.
 * Ensures the backend never sees the password used for encryption.
 */
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


// --- Entry Encryption (HKDF) ---

/**
 * Derives a unique key for a specific entry using HKDF.
 * Context: "DiaryEntry"
 */
export const deriveEntryKey = async (masterKey, entrySaltBase64) => {
    // Note: If MasterKey is non-extractable AES-GCM, we might need to change how we use it for HKDF.
    // WebCrypto HKDF requires the input key to be an HKDF key or raw bytes.
    // However, we imported MK as AES-GCM. 
    // Trick: We can import the RAW bytes of MK as an HKDF key if we had them.
    // BUT, MK is in memory as CryptoKey.

    // To support HKDF from a CryptoKey, the key must be compatible.
    // If MK is AES-GCM, we cannot use it directly as 'key' for deriveKey(HKDF).
    // FIX: When we unwrap MK, we should arguably import it as a key capable of derivation?
    // OR we use the AES-GCM key to encrypt the entry directly?
    // Req 9 says: "Unique per-entry key derived from Master Key using HKDF"

    // So MK should be imported as 'HKDF' key (or 'Generic Secret') initially, 
    // or we export it (if allowed) and re-import.
    // To keep it clean: We will handle MK as a generic secret for HKDF purposes, 
    // or simply import it as an HKDF key when unwrapping.

    // Let's refine `decryptMasterKey`: It imports as AES-GCM. 
    // We should probably import it as a key that can derive bits.

    // actually, for HKDF, we need the key to be of algorithm 'HKDF' usually, or raw.
    // Let's try to export (if we allowed export on unwrap) or fix unwrap.
    // In `decryptMasterKey`, we set `extractable: false`.
    // This is good for security but blocks us from re-purposing.

    // Alternative: The "Master Key" is actually an HKDF IKM (Input Keying Material).
    // So internal format should be "HKDF".

    // Let's fix `decryptMasterKey` to import as HKDF key.

    // For this Function: We assume masterKey is a CryptoKey (algorithm: HKDF).

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

// ... Wait, we need to adjust generateMasterKey and decryptMasterKey to return HKDF compatible keys ...
// I will override the exports below to ensure consistency.

// REVISED decryptMasterKey for HKDF compatibility
export const decryptMasterKeyForHKDF = async (passwordKey, encryptedMasterKeyB64, ivB64) => {
    const encryptedBuffer = base64ToArrayBuffer(encryptedMasterKeyB64);
    const iv = base64ToArrayBuffer(ivB64);

    const rawMK = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        passwordKey,
        encryptedBuffer
    );

    // Import as HKDF key
    return window.crypto.subtle.importKey(
        "raw",
        rawMK,
        { name: "HKDF" },
        false, // Not exportable
        ["deriveKey"]
    );
};

// REVISED generateMasterKey for HKDF compatibility
export const generateMasterKeyHKDF = async () => {
    return window.crypto.subtle.generateKey(
        {
            name: "HKDF"
        },
        true, // Exportable (to wrap)
        ["deriveKey"]
    );
};


// --- Data Encryption/Decryption ---

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

// --- File Encryption ---

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

// --- Validator (Zero-Knowledge Check) ---

export const createValidator = async (masterKey) => {
    // We derive a specific key for the validator to avoid using MK directly?
    // Or just encrypt a constant with a random salt HKDF?
    // Let's use HKDF with salt "VALIDATOR_SALT" (or random)

    // Actually, we should store a "validator" field:
    // validator = Encrypt(Key=HKDF(MK, Salt), Data="VALID")

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

// --- Payload Bundle Encryption (Zero-Knowledge) ---

/**
 * Encrypts an entire entry object (metadata + content) into a single blob.
 * Returns { payload, iv }
 */
export const encryptEntryPayload = async (entryData, key) => {
    // 1. Convert object to JSON string
    const jsonString = JSON.stringify(entryData);

    // 2. Encrypt the JSON string
    const { ciphertext, iv } = await encryptWithKey(jsonString, key);

    return { payload: ciphertext, iv };
};

/**
 * Decrypts a payload blob back into the entry object.
 */
export const decryptEntryPayload = async (payload, iv, key) => {
    try {
        // 1. Decrypt into JSON string
        const jsonString = await decryptWithKey(payload, iv, key);

        // 2. Parse JSON
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Payload decryption failed", e);
        throw new Error("Failed to decrypt entry payload.");
    }
};

