const bcrypt = require('bcrypt');
const User = require('../models/User');
const Joi = require("joi");


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

    const { name, email, password } = req.body; 

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


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = user_register;
