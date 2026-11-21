import express from "express";
import authorizedRoles from "../middlewares/authorizeRoles.js";
import authenticateUser from "../middlewares/authMiddleware.js";

import {
  getAllUsers,
  getUserById,
  updateUsersRole,
  updateAccountStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authenticateUser);

// Get all users: Admin only
router.get("/", authorizedRoles("admin"), getAllUsers);

// Get own profile or any profile as admin
router.get("/:id", getUserById);

// Update user role: Admin only
router.patch("/:id/role", authorizedRoles("admin"), updateUsersRole);

// Activate or deactivate account: Admin only
router.patch("/:id/status", authorizedRoles("admin"), updateAccountStatus);

export default router;
