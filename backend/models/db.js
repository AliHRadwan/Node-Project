import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const DB_URI = process.env.MONGO_URI;

    await mongoose.connect(DB_URI);

    console.log("MongoDB connected successfully");

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
