import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./models/db.js";
//const auth = require("./routes/auth");
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cart.routes.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/bookRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Import models
import "./models/Author.js";
import "./models/Category.js";
import Book from "./models/Book.js";

// --- Sync indexes ---
(async () => {
  try {
    await Book.syncIndexes();
    console.log("✅ Book indexes synced");
  } catch (e) {
    console.warn("⚠️ Index sync warning:", e.message);
  }
})();

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on: http://localhost:${port}`);
});
