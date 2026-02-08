const DiaryEntry = require('../models/diaryentry');
// const { encrypt, decrypt } = require('../utils/encryption'); // REMOVED: Client-side E2EE only
const fs = require('fs');
const path = require('path');

exports.createEntry = async (req, res) => {
  try {
    // Ensure photo paths are saved as /uploads/photos/filename.jpg
    const photoPaths = req.files?.photos?.map(file => `/uploads/photos/${file.filename}`) || [];
    let audioPath = null;
    if (req.files?.audio && req.files.audio[0]) {
      audioPath = `/uploads/audio/${req.files.audio[0].filename}`;
    }

    const entry = new DiaryEntry({
      title: req.body.title,
      content: req.body.content, // Already encrypted by client
      iv: req.body.iv,
      encryptedKey: req.body.encryptedKey,
      mood: req.body.mood,
      date: req.body.date,
      photos: photoPaths,
      audio: audioPath,
      user: req.user.id,
    });

    await entry.save();
    // entry.content = decrypt(entry.content); // REMOVED
    res.status(201).json(entry);
  } catch (err) {
    console.error("Create entry error:", err);
    res.status(500).json({ message: "Failed to create entry" });
  }
};

exports.updateEntry = async (req, res) => {
  const { id } = req.params;
  const { title, content, mood, date } = req.body;

  try {
    const entryCallback = await DiaryEntry.findById(id);
    if (!entryCallback) return res.status(404).json({ message: 'Entry not found' });

    // Ownership check
    if (entryCallback.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { title, mood, date };
    if (content) {
      updateData.content = content; // User must send encrypted content
      if (req.body.iv) updateData.iv = req.body.iv;
      if (req.body.encryptedKey) updateData.encryptedKey = req.body.encryptedKey;
    }

    if (req.files['photos']) {
      updateData.photos = req.files['photos'].map((file) => `/uploads/photos/${file.filename}`);
    }

    if (req.files['audio']) {
      updateData.audio = `/uploads/audio/${req.files['audio'][0].filename}`;
    }

    const updated = await DiaryEntry.findByIdAndUpdate(id, updateData, { new: true });
    // updated.content = decrypt(updated.content);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

exports.getEntryByTitle = async (req, res) => {
  try {
    const title = req.query.title || '';
    const entries = await DiaryEntry.find({
      title: new RegExp(title, 'i'),
      user: req.user.id
    });

    const decryptedEntries = entries; // Return raw encrypted data


    res.json(decryptedEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entry', error: err });
  }
};

exports.getAllEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user.id }).sort({ date: -1 });
    const decryptedEntries = entries; // Return raw encrypted data
    res.json(decryptedEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entries', error: err });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Delete files
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach(photoPath => {
        try {
          const filePath = path.join(__dirname, '..', photoPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) { console.error("Error deleting photo", e); }
      });
    }

    if (entry.audio) {
      try {
        const audioPath = entry.audio.startsWith('/uploads') ? entry.audio : `/uploads/audio/${entry.audio}`;
        const filePath = path.join(__dirname, '..', audioPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) { console.error("Error deleting audio", e); }
    }

    await DiaryEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err });
  }
};