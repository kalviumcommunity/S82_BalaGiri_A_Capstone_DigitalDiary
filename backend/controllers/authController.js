const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMagicLinkEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
  try {
    const { username, email, password, kdfSalt, validatorHash, encryptedMasterKey, masterKeyIV } = req.body;



    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username is already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      kdfSalt,
      validatorHash,
      encryptedMasterKey,
      masterKeyIV,
      encryptionVersion: 1
    });

    await newUser.save();
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.status(201).json({
      success: true,
      token,
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
  const { email, password } = req.body;
  try {


    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.status(200).json({
      success: true,
      token,
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
      return res.status(400).json({ message: 'User not found. Please sign up to initialize encryption.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.magicLinkToken = crypto.createHash('sha256').update(token).digest('hex');
    user.magicLinkExpires = Date.now() + 15 * 60 * 1000;

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
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.json({ isAuthenticated: false, user: null });

    try {
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
    } catch (e) {
      console.error("[Auth] getMe token verification failed:", e.message);
      return res.json({ isAuthenticated: false, user: null });
    }
  } catch (err) {
    console.error("[Auth] getMe error:", err);
    res.json({ isAuthenticated: false, user: null });
  }
};
