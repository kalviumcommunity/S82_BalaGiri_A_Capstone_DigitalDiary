const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMagicLinkEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
  try {
    const { username, email, password, publicKey, encryptedPrivateKey, salt, iv } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      username,
      email,
      password,
      publicKey,
      encryptedPrivateKey,
      salt,
      iv
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Set HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
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

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Set HttpOnly Cookie
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
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        salt: user.salt,
        iv: user.iv
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.requestMagicLink = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    // If user doesn't exist, Create one (optional strategy: only allow existing? Spec says "Auto-create user if not exists")
    if (!user) {
      user = new User({ email }); // Username/password optional
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.magicLinkToken = crypto.createHash('sha256').update(token).digest('hex');
    user.magicLinkExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    // Note: In production with separate frontend, this URL usually points to frontend, which then calls API.
    // User request says: "On link click: Verify token...". Usually link -> frontend -> API.
    // I will point to frontend route /verify-login?token=...
    const frontendUrl = `http://localhost:5173/verify-login?token=${token}`; // Assuming default Vite port or from env

    await sendMagicLinkEmail(user.email, frontendUrl);

    res.status(200).json({ message: 'Magic link sent to email' });

  } catch (err) {
    console.error('[Auth] Error during magic link request:', err);

    // If it's an email error, we might want to be explicit, but 500 is generally correct for server failure
    res.status(500).json({ message: 'Error sending magic link. Please check email configuration.' });
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

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5m' });

    res.status(200).json({ token: jwtToken, user: { email: user.email, username: user.username } });

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
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ isAuthenticated: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ isAuthenticated: false });

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        salt: user.salt,
        iv: user.iv
      }
    });
  } catch (err) {
    res.status(401).json({ isAuthenticated: false });
  }
};
