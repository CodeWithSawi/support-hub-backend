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

// ==========================
// GET Routes
// ==========================

// @route   GET /api/tickets
// @desc    Get all tickets
// @access  Public
router.get("/", getAllTickets);

// @route   GET /api/tickets/archived
// @desc    Get archived tickets
// @access  Public
router.get("/archived", getArchivedTickets);

// @route   GET /api/tickets/agent/:agentId
// @desc    Get tickets assigned to a specific agent
// @access  Public
router.get("/agent/:agentId", getTicketsByAgentId);

// @route   GET /api/tickets/:id
// @desc    Get a ticket by ID
// @access  Public
router.get("/ticketID", getTicketById);

// @route   GET /api/tickets/:ticketId/comments
// @desc    Get comments for a specific ticket
// @access  Public
router.get("/:ticketId/comments", getTicketComments);

// ==========================
// POST Routes
// ==========================

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Customer
router.post("/", createTicket);

// ==========================
// PUT Routes
// ==========================

// @route   PUT /api/tickets/:ticketId
// @desc    Update a ticket by ID
// @access  Private (Agent/Admin)
router.put("/:ticketId", updateTicket);

// ==========================
// PATCH Routes
// ==========================

// @route   PATCH /api/tickets/:ticketId/restore
// @desc    Restore an archived ticket by ID
// @access  Private (Admin)
router.patch("/:ticketId/restore", restoreTicket);

// ==========================
// DELETE Routes
// ==========================

// @route   DELETE /api/tickets/:ticketId
// @desc    Delete a ticket by ID
// @access  Private (Admin)
router.delete("/:ticketId", deleteTicket);

export default router;
