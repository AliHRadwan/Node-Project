import express from "express";
import dotenv from "dotenv";
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


dotenv.config();
connectDB();


const app = express();
const port = process.env.PORT || 3000;

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

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Node Project API" });
});

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
