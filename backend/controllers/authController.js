const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async(req,res)=>{
    try{
        const {username , email , password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({message: "User already existing "});

        const user = new User({ username,email,password});
        await user.save();
        res.status(201).json({message: "User created successfully"});
    }
    catch(err)
    {
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, user: { email: existingUser.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};