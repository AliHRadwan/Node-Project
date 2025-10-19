import crypto from "crypto";
import bcrypt from "bcrypt";
import Joi from "joi";
import User from "../models/User.js";
import Token from "../models/Token.js";

const resetpassSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message("Password must contain at least one uppercase, one lowercase, and one number")
    .required(),
});
 
const pass_reset = async (req, res) => {
  try {
    const { token } = req.params;

    const { error, value } = resetpassSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { password } = value;

    const hashed_token = crypto.createHash("sha256").update(token).digest("hex");
    const tokenDoc = await Token.findOne({ tokenHash: hashed_token, type: "reset" });
    if (!tokenDoc) {
      return res.status(400).json({ error: "Invalid Reset Link" });
    }
    if (tokenDoc.used) {
      return res.status(400).json({ error: "This reset link has already been used." });
    }
    if (tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset link expired." });
    }
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    user.passwordHash = hashed_password;
    await user.save();

    tokenDoc.used = true;
    await tokenDoc.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export default pass_reset;