const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const authenticateToken = require('../middleware/auth');
const DiaryEntry = require('../models/diaryentry');
const {
  getEntryByTitle,
  updateEntry,
  deleteEntry,
  createEntry,
  getAllEntries,
  getFile
} = require('../controllers/diaryController');

router.get('/all', authenticateToken, getAllEntries);

router.post(
  '/new',
  authenticateToken,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'audio', maxCount: 1 }
  ]),
  createEntry
);

// const { decrypt } = require('../utils/encryption'); // REMOVED

router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const latest = await DiaryEntry.find({ user: req.user.id }).sort({ date: -1 }).limit(3);
    // Return raw encrypted data
    res.status(200).json(latest);
  } catch (err) {
    console.error('Fetch latest entries error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/search', authenticateToken, getEntryByTitle);

router.get('/file/:type/:filename', authenticateToken, getFile);

router.put(
  '/update/:id',
  authenticateToken,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'audio', maxCount: 1 }
  ]),
  updateEntry
);


router.delete('/delete/:id', authenticateToken, deleteEntry);

module.exports = router;
