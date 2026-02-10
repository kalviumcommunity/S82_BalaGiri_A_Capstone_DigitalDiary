/*
  Security Utils - Web Crypto API
  - PBKDF2 for key derivation
  - AES-GCM (256-bit) for encryption
  - No external libraries
*/

// 1. Derive Key from Password (PBKDF2)
export async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // Convert hex salt to buffer if needed, or assume salt is passed as string and we need to encode it?
    // Usually salt is stored as hex string in DB. Let's assume input is hex string.
    // If salt is raw bytes, use it directly. 
    // To be safe, let's assume salt is a hex string from the backend.
    const saltBuffer = hexToBuffer(salt);

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 100000,
            hash: "SHA-256"
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false, // Key not extractable!
        ["encrypt", "decrypt"]
    );
}

// 2. Encrypt Data (AES-GCM)
export async function encryptData(data, key) {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encodedData = enc.encode(data);

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedData
    );

    return {
        iv: bufferToHex(iv),
        ciphertext: bufferToHex(encryptedContent)
    };
}

// 3. Decrypt Data
export async function decryptData(ciphertext, iv, key) {
    const dec = new TextDecoder();
    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: hexToBuffer(iv)
            },
            key,
            hexToBuffer(ciphertext)
        );
        return dec.decode(decryptedContent);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("Decryption failed (Wrong password?)");
    }
}

// Helpers
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function hexToBuffer(hex) {
    const tokens = hex.match(/.{1,2}/g) || [];
    const buffer = new Uint8Array(tokens.map(t => parseInt(t, 16)));
    return buffer.buffer;
}
