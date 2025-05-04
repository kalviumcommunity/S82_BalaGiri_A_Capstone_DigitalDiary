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

exports.login= async(req,res) => {
    try{
        const {email , password } = req.body;

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({ message: "User not found" });
        
        res.status(200).json({message:"Login successful",user:{username: user.username, email:user.email}});
    }
    catch (err)
    {
        res.status(500).json({message: "Server error"});
    }
};