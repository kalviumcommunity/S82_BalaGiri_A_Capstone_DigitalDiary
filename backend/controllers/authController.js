const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMagicLinkEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.status(201).json({ token, user: { email: newUser.email, username: newUser.username } });

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

    res.status(200).json({ token, user: { email: user.email, username: user.username } });
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

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-link/${token}`;
    // Note: In production with separate frontend, this URL usually points to frontend, which then calls API.
    // User request says: "On link click: Verify token...". Usually link -> frontend -> API.
    // I will point to frontend route /verify-login?token=...
    const frontendUrl = `http://localhost:5173/verify-login?token=${token}`; // Assuming default Vite port or from env

    await sendMagicLinkEmail(user.email, frontendUrl);

    res.status(200).json({ message: 'Magic link sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending magic link' });
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
