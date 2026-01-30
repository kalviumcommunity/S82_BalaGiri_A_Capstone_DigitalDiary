const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // Made optional
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional
    magicLinkToken: { type: String },
    magicLinkExpires: { type: Date }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);