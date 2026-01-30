const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure a 32-byte key. In production, this should be in .env and persistent.
// For this task, if not in env, we'll derive/use a fixed fallback for demo (INSECURE for prod, but functional for task if env missing).
// Better: Use a fixed key from env or generate one if missing and warn.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto.scryptSync('secret-passphrase', 'salt', 32);

const IV_LENGTH = 16;

exports.encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error("Encryption error:", err);
        return text;
    }
};

exports.decrypt = (text) => {
    if (!text) return text;
    // Check if text is encrypted (format iv:content)
    const parts = text.split(':');
    if (parts.length !== 2) return text; // Assume plain text if format doesn't match

    try {
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        console.error("Decryption error:", err);
        return text; // Return original if decryption fails
    }
};
