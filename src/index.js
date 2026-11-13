import express from "express";
import connectDB from "./config/dbConnect.js";
import "dotenv/config";
import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

const PORT = process.env.PORT || 5000;

// Connect to the database
// connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", healthRoutes);

// Routes for users
app.use("/api/users", userRoutes);

// Routes for tickets
app.use("/api/tickets", ticketRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
