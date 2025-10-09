const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require("crypto");
const Token = require("../models/Token");
const Joi = require("joi");
const sendEmail =require('../controllers/sendemail');


const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message("Password must contain at least one uppercase, one lowercase, and one number")
    .required(),
});

const user_register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name, email, password,addresses} = req.body; 

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userexists = await User.findOne({ email });
    if (userexists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const newuser = new User({
      name,
      email,
      passwordHash: hashed_password,
      role: "user",
      isVerified: false,
      addresses: []
    });

    await newuser.save();

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");

    await Token.create({
      userId: newuser._id,
      type: "verify",
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), 
      used: false,
    });
    const verifyLink = `http://localhost:3000/api/auth/verify/${verifyToken}`;

    const html = `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}" target="_blank">${verifyLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `;

    await sendEmail(newuser.email, "Verify your email address", html);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newuser._id,
        name: newuser.name,
        email: newuser.email,
        role: newuser.role,
        isVerified: newuser.isVerified,
        addresses: []
      },
    });

    // console.log("Verification link:", verifyLink);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = user_register;
