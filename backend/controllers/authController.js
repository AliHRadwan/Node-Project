import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import sendemail from "../controllers/sendemail.js";

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
    sendemail(user.email, 'New Login Alert', 'A new login to your account was detected.');
    
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

export { login, logout };