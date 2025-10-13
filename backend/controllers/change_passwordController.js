const bcrypt = require("bcrypt");
const User = require("../models/User");
const Joi = require("joi");

const newpasswordSchema = Joi.object({
  new_password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message("Password must contain at least one uppercase, one lowercase, and one number")
    .required(),
});


const password_change = async (req, res) => {
  try {
    const userId = req.user.id;

    const { old_password, new_password } = req.body;
    const { error } = newpasswordSchema.validate({ new_password });
    if(error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    if (!old_password || !new_password) {
      return res.status(400).json({ error: "Old and new passwords are required" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const verifying_old_password = await bcrypt.compare(old_password, user.passwordHash);
    if (!verifying_old_password) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    user.passwordHash = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = password_change;