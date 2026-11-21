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
  assignTicket,
  unassignTicket,
} from "../controllers/ticketsController.js";

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateUser);

// GET ROUTES
router.get("/", authorizedRoles("support_agent", "admin"), getAllTickets);

router.get("/archived", authorizedRoles("admin"), getArchivedTickets);

router.get(
  "/agent/:agentId",
  authorizedRoles("support_agent", "admin"),
  getTicketsByAgentId,
);

router.get("/:ticketId/comments", getTicketComments);
router.get("/:id", getTicketById);

// CREATE TICKET: Customers only
router.post("/", authorizedRoles("customer"), createTicket);

// UPDATE TICKET: Assigned agents and admins
router.put(
  "/:ticketId",
  authorizedRoles("admin", "support_agent"),
  updateTicket,
);

// DELETE TICKET: Admin only
router.delete("/:ticketId", authorizedRoles("admin"), deleteTicket);

// RESTORE TICKET: Admin only
router.patch("/:ticketId/restore", authorizedRoles("admin"), restoreTicket);

// ASSIGN TICKET: Admin only
router.patch("/:ticketId/assign", authorizedRoles("admin"), assignTicket);

// UNASSIGN TICKET: Admin only
router.patch("/:ticketId/unassign", authorizedRoles("admin"), unassignTicket);

export default router;
