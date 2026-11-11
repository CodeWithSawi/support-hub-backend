import express from "express";
import connectDB from "./config/dbConnect.js";
import "dotenv/config";
import healthRoutes from "./routes/healthRoutes.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
// Middleware
app.use(express.json());

// Routes
app.use("/api", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
