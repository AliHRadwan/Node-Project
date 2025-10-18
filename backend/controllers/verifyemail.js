import crypto from "crypto";
import Token from "../models/Token.js";
import User from "../models/User.js";

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDoc = await Token.findOne({
      tokenHash,
      type: "verify",
      used: false,
    });

    if (!tokenDoc)
      return res.status(400).json({ error: "Invalid or expired verification link." });

    if (tokenDoc.expiresAt < new Date())
      return res.status(400).json({ error: "Verification link expired." });

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isVerified = true;
    await user.save();

    await Token.findByIdAndUpdate(tokenDoc._id, { used: true });

    res.status(200).json({
      message: " Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during verification." });
  }
};

export default verifyEmail;