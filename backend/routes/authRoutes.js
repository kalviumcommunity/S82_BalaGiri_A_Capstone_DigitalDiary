const express = require('express');
const router = express.Router();
const { signup, loginUser, requestMagicLink, verifyMagicLogin, verifyMagicLink, getMe, logoutUser, resetPasswordRecovery, getRecoveryMetadata } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/magic-link', requestMagicLink); // keeping the endpoint to request the link the same
router.post('/magic-login', verifyMagicLogin); // new verification endpoint as requested
router.post('/verify-link', verifyMagicLink); // old endpoint
router.post('/reset-password-recovery', resetPasswordRecovery);
router.post('/recovery-metadata', getRecoveryMetadata);
router.get('/me', getMe);
router.post('/logout', logoutUser);

module.exports = router;