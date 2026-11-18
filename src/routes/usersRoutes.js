import express from "express";
import authorizedRoles from "../middlewares/authorizeRoles.js";
import authenticateUser from "../middlewares/authMiddleware.js";

import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// All user routes require authentication.
router.use(authenticateUser);

// Get all users: Admin only.
router.get("/", authorizedRoles("admin"), getAllUsers);

// Get a user's profile.
// Controller must check that the requester is either:
// 1. The user whose profile is being requested.
// 2. An admin.
router.get("/:id", getUserById);

export default router;
