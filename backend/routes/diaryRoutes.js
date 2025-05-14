const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const DiaryEntry = require('../models/diaryentry');

router.post(
  '/new',
  upload.fields([{ name: 'photos' }, { name: 'audio', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, content, mood, date } = req.body;

      const photos = req.files['photos']
        ? req.files['photos'].map(file => file.path)
        : [];

      const audio = req.files['audio'] ? req.files['audio'][0].path : '';

      const newEntry = new DiaryEntry({
        title,
        content,
        mood,
        date,
        photos,
        audio
      });

      await newEntry.save();

      res.status(201).json({ message: 'Diary entry created', entry: newEntry });
    } catch (err) {
      console.error('Error saving diary entry:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/latest',async(req,res)=>{
  try{
    const latest = await DiaryEntry.find().sort({date:-1}).limit(3);
    res.status(200).json(latest);
  }
  catch(err)
  {
    console.error('Fetch latest entries error:',err);
    res.status(500).json({message:"Server error"});
  }
});

module.exports = router;
