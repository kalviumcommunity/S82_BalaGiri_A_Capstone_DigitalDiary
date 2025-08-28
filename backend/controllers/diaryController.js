const DiaryEntry = require('../models/diaryentry');



exports.createEntry = async (req, res) => {
  try {
    const entry = new DiaryEntry({
      ...req.body,
      user: req.user.id, // Attach the user ID from the JWT
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error saving diary entry:', err);
    res.status(500).json({ message: 'Failed to create entry' });
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