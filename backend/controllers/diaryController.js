const DiaryEntry = require('../models/diaryentry');

exports.createEntry = async (req, res) => {
  try {
    const { title, content, mood, date } = req.body;
    const photoPaths = req.files['photos']?.map(file => file.path) || [];
    const audioPath = req.files['audio']?.[0]?.path || null;

    const newEntry = new DiaryEntry({
      title,
      content,
      mood,
      date,
      photos: photoPaths,
      audio: audioPath,
    });

    await newEntry.save();
    res.status(201).json({ message: 'Diary entry saved' });
  } catch (error) {
    console.error('Error saving diary entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
