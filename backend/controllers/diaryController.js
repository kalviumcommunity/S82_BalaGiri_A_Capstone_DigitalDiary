const DiaryEntry = require('../models/diaryentry');



exports.createEntry = async (req, res) => {
  try {
    const { title, content, mood, date } = req.body;

    const photos = req.files['photos']
      ? req.files['photos'].map(file => `/uploads/photos/${file.filename}`)
      : [];

    const audio = req.files['audio']
      ? `/uploads/audio/${req.files['audio'][0].filename}`
      : '';

    const newEntry = new DiaryEntry({ title, content, mood, date, photos, audio });

    await newEntry.save();
    res.status(201).json({ message: 'Diary entry created', entry: newEntry });
  } catch (err) {
    console.error('Error saving diary entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEntry = async (req, res) => {
  const { id } = req.params;
  const { title, content, mood, date } = req.body;

  const updateData = { title, content, mood, date };

  if (req.files['photos']) {
    updateData.photos = req.files['photos'].map((file) => file.filename);
  }

  if (req.files['audio']) {
    updateData.audio = req.files['audio'][0].filename;
  }

  try {
    const updated = await DiaryEntry.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
};



// Get entry by title
exports.getEntryByTitle = async (req, res) => {
  try {
    const title = req.query.title;
    const entries = await DiaryEntry.find({ title: new RegExp(title, 'i') });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entry', error: err });
  }
};

// Update entry by ID
exports.updateEntry = async (req, res) => {
  try {
    const updatedEntry = await DiaryEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err });
  }
};

// Delete entry by ID
exports.deleteEntry = async (req, res) => {
  try {
    const deletedEntry = await DiaryEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err });
  }
};
