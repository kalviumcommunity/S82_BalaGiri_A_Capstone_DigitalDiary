const DiaryEntry = require('../models/diaryentry');
const fs = require('fs');
const path = require('path');

exports.createEntry = async (req, res) => {
  try {
    const { payload, iv, entrySalt } = req.body;

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
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (entry.userId && entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }



    if (payload) entry.payload = payload;
    if (iv) entry.iv = iv;


    if (req.files?.photos) {
      const newPhotos = req.files.photos.map(f => `/uploads/photos/${f.filename}`);
      entry.attachments.push(...newPhotos);
    }
    if (req.files?.audio) {
      const newAudio = req.files.audio.map(f => `/uploads/audio/${f.filename}`);
      entry.attachments.push(...newAudio);
    }



    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};


exports.getEntryByTitle = async (req, res) => {
  res.status(400).json({ message: "Server-side search is disabled. Please perform search on the client." });
};

exports.getAllEntries = async (req, res) => {
  try {
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


    if (entry.attachments && entry.attachments.length > 0) {
      entry.attachments.forEach(filePath => {
        try {
          const fullPath = path.join(__dirname, '..', filePath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch (e) { console.error("Error deleting file", e); }
      });
    }


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


exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.params.type;

    if (!['photos', 'audio'].includes(type)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const pathSearch = `/uploads/${type}/${filename}`;


    const entry = await DiaryEntry.findOne({
      $or: [
        { "attachments": pathSearch },

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