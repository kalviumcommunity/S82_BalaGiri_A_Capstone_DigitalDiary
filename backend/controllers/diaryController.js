const DiaryEntry = require('../models/diaryentry');
const fs = require('fs');
const path = require('path');

exports.createEntry = async (req, res) => {
  try {
    const { payload, iv, entrySalt } = req.body;

    // Collect all uploaded file paths (photos + audio)
    const attachments = [];

    if (req.files?.photos) {
      req.files.photos.forEach(file => {
        attachments.push(`/uploads/photos/${file.filename}`);
      });
    }

    if (req.files?.audio) {
      req.files.audio.forEach(file => {
        attachments.push(`/uploads/audio/${file.filename}`);
      });
    }

    const entry = new DiaryEntry({
      userId: req.user.id,
      payload,
      iv,
      entrySalt,
      attachments,
      encryptionVersion: 2
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
  const { payload, iv } = req.body;

  try {
    const entry = await DiaryEntry.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (entry.user && entry.user.toString() !== req.user.id) {
      // Support both user and userId field names if migration is messy, assuming schema uses userId
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Double check with schema: Schema uses userId.
    if (entry.userId && entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }


    // Update Payload
    if (payload) entry.payload = payload;
    if (iv) entry.iv = iv;

    // Append new attachments
    if (req.files?.photos) {
      const newPhotos = req.files.photos.map(f => `/uploads/photos/${f.filename}`);
      entry.attachments.push(...newPhotos);
    }
    if (req.files?.audio) {
      const newAudio = req.files.audio.map(f => `/uploads/audio/${f.filename}`);
      entry.attachments.push(...newAudio);
    }

    // Note: We do not handle deletion of specific old files here because the backend 
    // doesn't know which file inside the detailed encrypted payload corresponds to which attachment path.
    // The client should send a separate request to "delete attachment path X" if needed, 
    // or we replace the whole entry. 
    // For this implementation, we just append.

    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

// Client-side search only
exports.getEntryByTitle = async (req, res) => {
  res.status(400).json({ message: "Server-side search is disabled. Please perform search on the client." });
};

exports.getAllEntries = async (req, res) => {
  try {
    // Return all blobs. Client decrypts and sorts.
    // We sort by _id (approx insertion time) just to give a stable order.
    const entries = await DiaryEntry.find({ userId: req.user.id }).sort({ _id: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entries', error: err });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Delete associated files
    if (entry.attachments && entry.attachments.length > 0) {
      entry.attachments.forEach(filePath => {
        try {
          const fullPath = path.join(__dirname, '..', filePath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch (e) { console.error("Error deleting file", e); }
      });
    }

    // Legacy support: Check old fields if they exist
    if (entry.photos) {
      entry.photos.forEach(p => {
        try {
          const pathStr = typeof p === 'string' ? p : p.path;
          if (pathStr) {
            const fullPath = path.join(__dirname, '..', pathStr);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          }
        } catch (e) { }
      });
    }
    if (entry.audio) {
      try {
        const pathStr = typeof entry.audio === 'string' ? entry.audio : entry.audio.path;
        if (pathStr) {
          const fullPath = path.join(__dirname, '..', pathStr);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      } catch (e) { }
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

    const pathSearch = `/uploads/${type}/${filename}`;

    // Find valid entry containing this attachment
    const entry = await DiaryEntry.findOne({
      $or: [
        { "attachments": pathSearch },
        // Legacy support
        { "photos.path": pathSearch },
        { "audio.path": pathSearch }
      ]
    });

    if (!entry) {
      return res.status(404).json({ message: "File not found" });
    }

    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filePath = path.join(__dirname, '..', 'uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};