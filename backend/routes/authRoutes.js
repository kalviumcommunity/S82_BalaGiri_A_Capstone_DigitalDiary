const express = require('express');
const router = express.Router();
const User = require('../models/User'); // bcrypt not needed here

// Signup/Register
const handleSignup = async (req, res) => {
  console.log("Signup/Register hit");
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Just pass the raw password; Mongoose will hash it in the model
    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup/Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

router.post('/signup', handleSignup);
router.post('/register', handleSignup);

// Login
router.post('/login', async (req, res) => {
  console.log("Login request");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare raw password with hashed one from DB
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    return res.status(200).json({
      message: "Login successful",
      user: { username: user.username, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;