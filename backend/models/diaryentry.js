const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String },
  date: { type: String, required: true },
  photos: [{ type: String }],
  audio: { type: String }
});

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
