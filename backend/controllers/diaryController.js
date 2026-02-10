const DiaryEntry = require('../models/diaryentry');
// const { encrypt, decrypt } = require('../utils/encryption'); // REMOVED: Client-side E2EE only
const fs = require('fs');
const path = require('path');

exports.createEntry = async (req, res) => {
  try {
    const photoMetadata = req.body.photoMetadata ? JSON.parse(req.body.photoMetadata) : [];
    const audioMetadata = req.body.audioMetadata ? JSON.parse(req.body.audioMetadata) : null;

    const photos = req.files?.photos?.map((file, index) => {
      const meta = photoMetadata[index] || {};
      return {
        path: `/uploads/photos/${file.filename}`,
        iv: meta.iv,
        mimeType: meta.mimeType || file.mimetype,
        originalName: meta.originalName || file.originalname
      };
    }) || [];

    let audio = null;
    if (req.files?.audio && req.files.audio[0]) {
      const file = req.files.audio[0];
      const meta = audioMetadata || {};
      audio = {
        path: `/uploads/audio/${file.filename}`,
        iv: meta.iv,
        mimeType: meta.mimeType || file.mimetype,
        originalName: meta.originalName || file.originalname
      };
    }

    const entry = new DiaryEntry({
      title: req.body.title,
      content: req.body.content,
      iv: req.body.iv,
      encryptedKey: req.body.encryptedKey,
      mood: req.body.mood,
      date: req.body.date,
      photos: photos,
      audio: audio,
      user: req.user.id,
    });

    await entry.save();
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
    const entry = await DiaryEntry.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) entry.title = title;
    if (mood) entry.mood = mood;
    if (date) entry.date = date;

    if (content) {
      entry.content = content;
      if (req.body.iv) entry.iv = req.body.iv;
      if (req.body.encryptedKey) entry.encryptedKey = req.body.encryptedKey;
    }

    // Handle new photos
    if (req.files?.photos) {
      const photoMetadata = req.body.photoMetadata ? JSON.parse(req.body.photoMetadata) : [];
      const newPhotos = req.files.photos.map((file, index) => {
        const meta = photoMetadata[index] || {};
        return {
          path: `/uploads/photos/${file.filename}`,
          iv: meta.iv,
          mimeType: meta.mimeType || file.mimetype,
          originalName: meta.originalName || file.originalname
        };
      });
      // Append or replace? Usually append or User logic decided. 
      // For simple logic, let's append.
      entry.photos.push(...newPhotos);
    }

    // Handle new audio (replace existing)
    if (req.files?.audio && req.files.audio[0]) {
      const file = req.files.audio[0];
      const audioMetadata = req.body.audioMetadata ? JSON.parse(req.body.audioMetadata) : null;
      const meta = audioMetadata || {};

      // Delete old audio if exists
      if (entry.audio && entry.audio.path) {
        try {
          const oldPath = path.join(__dirname, '..', entry.audio.path);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (e) { console.error("Error deleting old audio", e); }
      }

      entry.audio = {
        path: `/uploads/audio/${file.filename}`,
        iv: meta.iv,
        mimeType: meta.mimeType || file.mimetype,
        originalName: meta.originalName || file.originalname
      };
    }

    const updated = await entry.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

exports.getEntryByTitle = async (req, res) => {
  // Server-side search is disabled for E2EE.
  // Titles are encrypted and cannot be queried by plaintext.
  // Search is performed client-side on decrypted data.
  res.status(400).json({ message: "Server-side search is disabled. Please perform search on the client." });
};

exports.getAllEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user.id }).sort({ date: -1 });
    res.json(entries);
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
      entry.photos.forEach(photo => {
        try {
          // handle both old string paths and new object paths for backward compatibility if needed
          const p = typeof photo === 'string' ? photo : photo.path;
          if (p) {
            const filePath = path.join(__dirname, '..', p);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
        } catch (e) { console.error("Error deleting photo", e); }
      });
    }

    if (entry.audio) {
      try {
        const p = typeof entry.audio === 'string' ? entry.audio : entry.audio.path;
        if (p) {
          const filePath = path.join(__dirname, '..', p);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (e) { console.error("Error deleting audio", e); }
    }

    await DiaryEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err });
  }
};

// Secure File Retrieval
exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.params.type; // 'photos' or 'audio'

    if (!['photos', 'audio'].includes(type)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Search for the entry that contains this file path
    // Note: Filename should be unique enough.
    const pathSearch = `/uploads/${type}/${filename}`;

    const entry = await DiaryEntry.findOne({
      $or: [
        { "photos.path": pathSearch },
        { "audio.path": pathSearch }
      ]
    });

    if (!entry) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check ownership
    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filePath = path.join(__dirname, '..', 'uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    // Stream the file
    // Set generic binary type, or the specific encrypted mime type if we stored it?
    // Actually, we should send it as application/octet-stream or similar,
    // client knows it's encrypted.
    res.setHeader('Content-Type', 'application/octet-stream');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};