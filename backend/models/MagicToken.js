const mongoose = require('mongoose');

const magicTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '10m' }
    }
});

module.exports = mongoose.model('MagicToken', magicTokenSchema);
