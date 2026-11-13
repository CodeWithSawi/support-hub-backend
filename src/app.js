// app.js
import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

const app = express();

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

export default app;
