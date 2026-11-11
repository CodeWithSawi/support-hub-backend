import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState;

  let dbHealth = "";

  switch (dbStatus) {
    case 0:
      dbHealth = "Disconnected";
      break;
    case 1:
      dbHealth = "Connected";
      break;
    case 2:
      dbHealth = "Connecting";
      break;
    case 3:
      dbHealth = "Disconnecting";
      break;
    default:
      dbHealth = "Unknown";
      break;
  }

  const healthStatus = {
    server: "up",
    database: dbHealth,
  };

  if (dbHealth === "Connected") {
    res.status(200).json({
      healthStatus,
    });
  } else {
    res.status(500).json({ healthStatus });
  }
});

export default router;
