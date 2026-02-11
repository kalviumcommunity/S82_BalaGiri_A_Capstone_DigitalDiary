const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ZERO-KNOWLEDGE PAYLOAD
  // Contains (encrypted JSON): { title, content, date, mood, fileMetadata, ... }
  payload: { type: String, required: true },

  // Encryption Metadata for the Payload
  iv: { type: String, required: true }, // IV used to encrypt the payload
  entrySalt: { type: String, required: true }, // Salt used to derive the key for this entry

  // Attachments (Files are encrypted separately)
  // We strictly store PATHS here to manage file deletion/serving.
  // All metadata (Original Name, MIME Type, File IV) is inside the encrypted payload.
  attachments: [{
    type: String // Path to file on disk (e.g., "/uploads/photos/xyz.enc")
  }],

  // Versioning allows future crypto upgrades
  encryptionVersion: { type: Number, default: 2 }

}, { timestamps: false }); // Disable timestamps to prevent frequency analysis

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
