import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.activeToken !== token)
      return res.status(403).json({ message: "Invalid or expired session" });

    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// module.exports = verifyJWT;
export default verifyJWT;