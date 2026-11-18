import express from "express";
import authorizedRoles from "../middlewares/authorizeRoles.js";
import authenticateUser from "../middlewares/authMiddleware.js";
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

router.use(authenticateUser);

// GET ROUTES
router.get("/", authorizedRoles("support_agent", "admin"), getAllTickets);
router.get("/archived", authorizedRoles("admin"), getArchivedTickets);
router.get("/agent/:agentId", getTicketsByAgentId);
router.get("/:ticketId/comments", getTicketComments);
router.get("/:id", getTicketById);

// POST ROUTES
// @route POST /api/tickets
// @desc Create a new ticket
// @access Customer
router.post("/", createTicket);

// PUT ROUTES
// @route PUT /api/tickets/:ticketId
// @desc Update a ticket by ID
// @access Private (Agent/Admin)
router.put("/:ticketId", authorizedRoles("admin"), updateTicket);

// DELETE ROUTES
// @route DELETE /api/tickets/:ticketId
// @desc Delete a ticket by ID
// @access Private (Admin)
router.delete("/:ticketId", authorizedRoles("admin"), deleteTicket);

// PATCH /api/tickets/:ticketId/restore
router.patch("/:ticketId/restore", authorizedRoles("admin"), restoreTicket);

export default router;
