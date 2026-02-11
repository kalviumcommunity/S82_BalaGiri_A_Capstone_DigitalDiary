const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMagicLinkEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
  try {
    // New Flow: Client sends AuthToken as 'password', plus KDF fields
    const { username, email, password, kdfSalt, validatorHash, encryptedMasterKey, masterKeyIV } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      username,
      email,
      password, // This is the AuthToken from client, hashed by pre-save hook
      kdfSalt, // PUBLIC: Random salt for client-side PBKDF2
      validatorHash, // PUBLIC: Encrypted "Validator" string
      encryptedMasterKey,
      masterKeyIV,
      encryptionVersion: 1
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Increased to 1h to match cookie
    );

    // Set HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        kdfSalt: newUser.kdfSalt,
        kdfIterations: newUser.kdfIterations,
        validatorHash: newUser.validatorHash,
        encryptedMasterKey: newUser.encryptedMasterKey,
        masterKeyIV: newUser.masterKeyIV
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body; // 'password' here is the AuthToken
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare AuthToken (password) with stored Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        kdfSalt: user.kdfSalt,
        kdfIterations: user.kdfIterations,
        validatorHash: user.validatorHash,
        encryptedMasterKey: user.encryptedMasterKey,
        masterKeyIV: user.masterKeyIV
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.requestMagicLink = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      // We cannot create a user purely via Magic Link anymore for E2EE 
      // because we need the KDF Salt and Validator Hash setup.
      // Returning error for now.
      return res.status(400).json({ message: 'User not found. Please sign up to initialize encryption.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.magicLinkToken = crypto.createHash('sha256').update(token).digest('hex');
    user.magicLinkExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const frontendUrl = `http://localhost:5173/verify-login?token=${token}`;

    await sendMagicLinkEmail(user.email, frontendUrl);

    res.status(200).json({ message: 'Magic link sent to email' });

  } catch (err) {
    console.error('[Auth] Error:', err);
    res.status(500).json({ message: 'Error sending magic link.' });
  }
};

exports.verifyMagicLink = async (req, res) => {
  const { token } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      magicLinkToken: hashedToken,
      magicLinkExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.magicLinkToken = undefined;
    user.magicLinkExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token: jwtToken,
      user: {
        email: user.email,
        username: user.username,
        kdfSalt: user.kdfSalt,
        kdfIterations: user.kdfIterations,
        validatorHash: user.validatorHash,
        encryptedMasterKey: user.encryptedMasterKey,
        masterKeyIV: user.masterKeyIV
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying magic link' });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token; // Checks HttpOnly cookie
    if (!token) return res.json({ isAuthenticated: false, user: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.json({ isAuthenticated: false, user: null });

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        kdfSalt: user.kdfSalt,
        kdfIterations: user.kdfIterations,
        validatorHash: user.validatorHash,
        encryptedMasterKey: user.encryptedMasterKey,
        masterKeyIV: user.masterKeyIV
      }
    });
  } catch (err) {
    res.json({ isAuthenticated: false, user: null });
  }
};
