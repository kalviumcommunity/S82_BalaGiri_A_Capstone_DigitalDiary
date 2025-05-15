const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const DiaryEntry = require('../models/diaryentry');
const {
  getEntryByTitle,
  updateEntry,
  deleteEntry,
} = require('../controllers/diaryController');
const diaryController = require('../controllers/diaryController')
// CREATE new diary entry
router.post(
  '/new',
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'audio', maxCount: 1 }
  ]),
  diaryController.createEntry 
);

// GET latest 3 entries
router.get('/latest', async (req, res) => {
  try {
    const latest = await DiaryEntry.find().sort({ date: -1 }).limit(3);
    res.status(200).json(latest);
  } catch (err) {
    console.error('Fetch latest entries error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET entry by title (for search)
router.get('/search', getEntryByTitle);

// UPDATE diary entry by ID
router.put(
  '/update/:id',
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'audio', maxCount: 1 }
  ]),
  updateEntry
);

// DELETE diary entry by ID
router.delete('/delete/:id', deleteEntry);

module.exports = router;
