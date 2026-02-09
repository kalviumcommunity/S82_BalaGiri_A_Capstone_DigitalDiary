const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // Made optional
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional
    magicLinkToken: { type: String },
    magicLinkExpires: { type: Date },
    publicKey: { type: String }, // JWK public key
    encryptedPrivateKey: { type: String }, // Encrypted JWK private key
    iv: { type: String }, // IV for private key encryption
    salt: { type: String } // Salt used for key derivation
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);