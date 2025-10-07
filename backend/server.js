require("dotenv").config();

const express = require("express");
const connectDB = require("./models/db");
const auth = require("./routes/auth");

const app = express();
const port = 3000;

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

app.use("/api/auth", auth);

app.listen(port, () => {
  console.log(`🚀 Server running on: http://localhost:${port}`);
});
