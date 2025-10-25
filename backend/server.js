import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import connectDB from "./config/db.js";
import { winstonLogger, winstonStream } from "./config/logger.js";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import sessionMiddleware from "./middleware/sessionConfig.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/payment.routes.js";
import paymentWebhook from "./webhooks/stripe.webhook.js";
import { verifyEmailTransport } from "./services/mailer.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { connectRedis } from "./config/redis.js";
import chatRoutes from "./routes/chatRoutes.groq.js";
import profileRoutes from "./routes/profileRoutes.js";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
})

connectDB();
connectRedis();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(sessionMiddleware);

verifyEmailTransport();
app.use(morgan("combined", { stream: winstonStream }));
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), paymentWebhook);


app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Node Project API" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  winstonLogger.info(`Server running on: http://localhost:${PORT}`);
});
