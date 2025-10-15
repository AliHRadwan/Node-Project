import express from "express";
import dotenv from "dotenv";
import connectDB from "./models/db.js";
import auth from "./routes/auth.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from './routes/cart.routes.js';

dotenv.config();
connectDB(); // connect database

//express
const app = express();
const port = 3000;
app.use(express.json());

app.use("/api/auth", auth);
app.use('/api/cart', cartRoutes);  
app.use("/api/orders", orderRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

app.listen(port, () => {
    console.log(`Server running on: http://localhost:${port}`);
});

