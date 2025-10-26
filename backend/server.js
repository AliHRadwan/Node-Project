import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { wssInit } from "./utils/websocket.js"
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
import startLogsCleanerSchedule from "./utils/cron-jobs.js";
import profileRoutes from "./routes/profileRoutes.js";

const generalAPILimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: "Too many requests from this IP, please try again after 15 minutes."
});

const authAPILimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10, // Limit each IP to 10 auth attempts per window
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: "Too many authentication attempts from this IP, please try again after 15 minutes."
});

dotenv.config();
connectDB();
connectRedis();
startLogsCleanerSchedule();
verifyEmailTransport();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(sessionMiddleware);
app.use(morgan("combined", { stream: winstonStream }));


app.use(express.static("public"));
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), paymentWebhook);

app.use("/api/auth", authAPILimiter, authRoutes);
app.use("/api/orders", generalAPILimiter, orderRoutes);
app.use("/api/books", generalAPILimiter, bookRoutes);
app.use("/api/authors", generalAPILimiter, authorRoutes);
app.use("/api/categories", generalAPILimiter, categoryRoutes);
app.use("/api/reviews", generalAPILimiter, reviewRoutes);
app.use("/api/cart", generalAPILimiter, cartRoutes);
app.use("/api/payments", generalAPILimiter, paymentRoutes);
app.use("/api/upload", generalAPILimiter, uploadRoutes);
app.use("/api/download", generalAPILimiter, downloadRoutes);
app.use("/api/chat", generalAPILimiter, chatRoutes);
app.use("/api/profile", generalAPILimiter, profileRoutes);

app.use(notFound);
app.use(errorHandler);

const httpServer = createServer(app);
wssInit(httpServer);

httpServer.listen(PORT, () => {
	winstonLogger.info(`Server running on: http://localhost:${PORT}`);
});