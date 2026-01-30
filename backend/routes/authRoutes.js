const express = require('express');
const router = express.Router();
const { signup, loginUser, requestMagicLink, verifyMagicLink } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/register', signup);
router.post('/login', loginUser);
router.post('/magic-link', requestMagicLink);
router.post('/verify-link', verifyMagicLink);

module.exports = router;