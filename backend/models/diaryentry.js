const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  payload: { type: String, required: true },
  iv: { type: String, required: true },
  entrySalt: { type: String, required: true },
  attachments: [{
    type: String
  }],
  encryptionVersion: { type: Number, default: 2 }

}, { timestamps: false });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
