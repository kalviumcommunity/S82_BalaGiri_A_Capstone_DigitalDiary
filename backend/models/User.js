const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },

    authVerifier: { type: String },
    password: { type: String },

    kdfSalt: { type: String, required: true },
    kdfIterations: { type: Number, default: 600000 },
    validatorHash: { type: String },
    encryptedMasterKey: { type: String },
    masterKeyIV: { type: String },

    encryptionVersion: { type: Number, default: 1 },

    magicLinkToken: { type: String },
    magicLinkExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$'))) {
        return next();
    }


    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);