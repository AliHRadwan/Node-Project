import crypto from "crypto";
import bcrypt from "bcrypt";
import Joi from "joi";
import User from "../models/User.js";
import Token from "../models/Token.js";
import sendEmail from "../services/sendemail.js";

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
    
    await sendEmail(
      user.email,
      "Password Reset Successfully",
      ` <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Password Reset Successful</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>Your password has been <strong>reset successfully</strong>! 🎉</p>
        <p>You can now log in with your new password:</p>
        <a href="https://yourapp.com/login" 
          style="background-color: #2ecc71; color: white; padding: 10px 16px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold;">
          Log in Now
        </a>
        <br /><br />
        <p>If you didn’t perform this action, please contact our support team immediately.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 20px;" />
        <small style="color: #888;">This is an automated message, please do not reply.</small>
      </div>
      `
    );

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export default pass_reset;