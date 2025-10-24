import dotenv from "dotenv";
import express from "express";
import connectDB from "./models/db.js";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import sessionMiddleware from "./middleware/sessionConfig.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/payment.routes.js";
import paymentWebhook from "./webhooks/stripe.webhook.js";
import mongoose from "mongoose";
import Book from "./models/Book.js";
import { verifyEmailTransport } from "./services/mailer.js";




dotenv.config();
connectDB();

const app = express();

verifyEmailTransport();

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Connected");
//     Book.updateMany(
//       { reserved: { $exists: false } },
//       { $set: { reserved: 0 } }
//     ).then(res => {
//       console.log(`📘 Migration: ${res.modifiedCount} books updated with reserved=0`);
//     }).catch(err => {
//       console.error("❌ Migration error:", err);
//     });
//   })
//   .catch(err => console.error("❌ DB Connection Error:", err));

const port = process.env.PORT || 3000;

// Webhook endpoint (قبل body parser)
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), paymentWebhook);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Node Project API" });
});

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
