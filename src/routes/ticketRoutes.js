import express from "express";
import {
  getAllTickets,
  getArchivedTickets,
  getTicketById,
  getTicketComments,
  getTicketsByAgentId,
  createTicket,
  updateTicket,
  deleteTicket,
  restoreTicket,
} from "../controllers/ticketsController.js";

const router = express.Router();

// @route   GET /api/tickets
// @desc    Get all tickets
// @access  Public
router.get("/", getAllTickets);

// GET /api/tickets/archived
router.get("/archived", getArchivedTickets);

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

// PUT ROUTES
// @route PUT /api/tickets/:ticketId
// @desc Update a ticket by ID
// @access Private (Agent/Admin)
router.put("/:ticketId", updateTicket);

// DELETE ROUTES
// @route DELETE /api/tickets/:ticketId
// @desc Delete a ticket by ID
// @access Private (Admin)
router.delete("/:ticketId", deleteTicket);

// PATCH /api/tickets/:ticketId/restore
router.patch("/:ticketId/restore", restoreTicket);

export default router;
