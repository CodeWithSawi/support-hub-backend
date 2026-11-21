import express from "express";
import authenticateUser from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import authorizedRoles from "../middlewares/authorizeRoles.js";

const router = express.Router();
router.use(authenticateUser);

router.get("/stats", authorizedRoles("admin"), getDashboardStats);

export default router;
