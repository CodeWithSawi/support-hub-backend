import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Public
router.get("/", getAllUsers);

// @route GET /api/users/:id
// @desc Get a user by ID
// @access Public
router.get("/:id", getUserById);

export default router;
