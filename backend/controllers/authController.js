import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import sendemail from "../services/sendemail.js";
import fetch from "node-fetch";
import { UAParser } from "ua-parser-js";


// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await Session.deleteMany({ userId: user._id });

    const token = jwt.sign(
      { id: user._id, email: user.email, addresses: user.addresses, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await Session.create({
      userId: user._id,
      token: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        addresses: user.addresses,
        role: user.role
      }
    });
    await sendLoginEmail(req, user);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];

    await Session.deleteOne({ userId: userId, token: token });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



const sendLoginEmail = async (req, user) => {
  try {
    // ✅ استخرج الـ IP الحقيقي
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown IP";

    // 🌍 استخرج اللوكيشن من API مجاني
    let location = "Unknown";
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      if (!data.error && data.city) {
        location = `${data.city}, ${data.country_name}`;
      }
    } catch {
      location = "Unknown";
    }

    // 💻 استخرج نوع الجهاز والمتصفح
    const ua = new UAParser(req.headers["user-agent"]);
    const browser = ua.getBrowser().name || "Unknown Browser";
    const os = ua.getOS().name || "Unknown OS";
    const device = ua.getDevice().type ? ua.getDevice().type : "Desktop";

    // 🕓 الوقت الحالي بتوقيت القاهرة
    const date = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" });

    // ✉️ محتوى الرسالة
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Hello ${user.name || "User"},</h2>

        <p>We noticed a new login to your account.</p>
        <p>If this was you, no action is needed.</p>
        <p>If you didn’t initiate this login, please 
          <a href="https://yourapp.com/reset-password" 
             style="color: #e74c3c; text-decoration: none; font-weight: bold;">
             reset your password
          </a> immediately.
        </p>

        <div style="background: #f4f6f8; padding: 12px; border-radius: 8px; margin: 15px 0;">
          <strong>🔐 Login Details:</strong><br>
          📅 <b>Date:</b> ${date}<br>
          🌍 <b>Location:</b> ${location}<br>
          💻 <b>Device:</b> ${device}<br>
          🧠 <b>OS:</b> ${os}<br>
          🌐 <b>Browser:</b> ${browser}<br>
          🧩 <b>IP:</b> ${ip}
        </div>

        <p>Stay safe,<br><strong>The BookStore Security Team</strong></p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 20px;" />
        <small style="color: #888;">This is an automated message, please do not reply.</small>
      </div>
    `;

    // 🚀 استدعاء دالة الإرسال الأصلية
    await sendemail(user.email, "🔐 New Login Detected on Your Account", html);
    console.log("✅ Login email sent successfully to:", user.email);
  } catch (err) {
    console.error("❌ Error sending login email:", err);
  }
};

export { login, logout };