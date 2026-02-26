const express = require('express');
const router = express.Router();
const { signup, loginUser, requestMagicLink, verifyMagicLink, getMe, logoutUser } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/magic-link', requestMagicLink);
router.post('/verify-link', verifyMagicLink);
router.get('/me', getMe);
router.post('/logout', logoutUser);

module.exports = router;