const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  iv: { type: String }, // Initialization Vector
  encryptedKey: { type: String }, // AES key encrypted with user public key
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String },
  date: { type: String, required: true },
  photos: [{
    path: { type: String, required: true },
    iv: { type: String, required: true },
    mimeType: { type: String, required: true },
    originalName: { type: String }
  }],
  audio: {
    path: { type: String },
    iv: { type: String },
    mimeType: { type: String },
    originalName: { type: String }
  }
});

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
