import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { winstonLogger, winstonStream } from "./config/logger.js";
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
import reviewRoutes from "./routes/reviewRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("combined", { stream: winstonStream }));

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
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Node Project API" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  winstonLogger.info(`Server running on: http://localhost:${PORT}`);
});
