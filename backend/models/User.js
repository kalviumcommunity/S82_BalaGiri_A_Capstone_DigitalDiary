const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },

    // Auth Verifier (Hash of the Auth Token)
    // The backend NEVER sees the real password. 
    // It receives HMAC(Password, "AUTH") and hashes it again here.
    authVerifier: { type: String },

    // Legacy Password field - strictly for migration/fallback or if we settle on a different auth flow.
    // In this zero-knowledge design, we primarily use authVerifier. 
    // But to keep it simple with existing Passport/Auth logic, 
    // we might just store the 'password' as the hashed AuthToken.
    // Let's keep 'password' for compatibility but knowing it stores the Hashed Auth Token.
    password: { type: String },

    // Encryption Metadata (Public)
    kdfSalt: { type: String, required: true }, // Base64 Random Salt for PBKDF2
    kdfIterations: { type: Number, default: 600000 },

    // Validator for Client-Side Password Check
    // Format: "salt:iv:ciphertext" (AES-GCM of known string)
    validatorHash: { type: String },

    // Wrapped Master Key (Zero-Knowledge)
    // Encrypted with Key derived from Password.
    // The backend NEVER sees the plaintext Master Key.
    encryptedMasterKey: { type: String }, // Base64
    masterKeyIV: { type: String }, // Base64

    encryptionVersion: { type: Number, default: 1 },

    magicLinkToken: { type: String },
    magicLinkExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);