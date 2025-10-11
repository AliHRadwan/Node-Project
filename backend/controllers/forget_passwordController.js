const crypto = require("crypto");
const Token = require("../models/Token");
const User = require("../models/User");
const sendEmail = require("./sendemail");

const pass_forgot = async (req, res) => {
  try {
    const { email } = req.body; 
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "User Not Found" });

    const reset_token = crypto.randomBytes(32).toString("hex"); 
    const hashed_token = crypto.createHash("sha256").update(reset_token).digest("hex");

    await Token.create({
      userId: user._id,
      type: "reset",
      tokenHash:hashed_token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
    });

    const resetLink = `http://localhost:3000/api/auth/reset-password/${reset_token}`;    
    

    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail(user.email, "Password Reset", html);

    res.json({ message: "Reset Email Has been sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = pass_forgot;
