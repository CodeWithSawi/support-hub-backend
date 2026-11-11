import express from "express";
import {
  getAllTickets,
  getTicketById,
  getTicketComments,
  getTicketsByAgentId,
  createTicket,
} from "../controllers/ticketsController.js";

const router = express.Router();

// @route   GET /api/tickets
// @desc    Get all tickets
// @access  Public
router.get("/", getAllTickets);

// @route GET /api/tickets/:id
// @desc Get a ticket by ID
// @access Public
router.get("/:id", getTicketById);

// @route GET /api/tickets/:ticketId/comments
// @desc Get comments for a specific ticket
// @access Public
router.get("/:ticketId/comments", getTicketComments);

// @route GET /api/tickets/agent/:agentId
// @desc Get tickets assigned to a specific agent
// @access Public
router.get("/agent/:agentId", getTicketsByAgentId);

// POST ROUTES
// @route POST /api/tickets
// @desc Create a new ticket
// @access Customer
router.post("/", createTicket);
export default router;
