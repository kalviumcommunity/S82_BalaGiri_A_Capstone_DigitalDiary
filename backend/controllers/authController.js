const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

 
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.status(200).json({ token, user: { id: user._id, email: user.email } });
};