import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

// Allowed ticket values
const validPriorities = ["low", "medium", "high", "urgent"];

const validCategories = ["technical", "billing", "account", "general", "other"];

const validStatuses = [
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

// Helper: check whether an ID is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: check whether the requester can access a ticket
const canAccessTicket = (ticket, user) => {
  const isOwner = ticket.customerId.toString() === user.id;
  const isAssignedAgent = ticket.assignedAgentId?.toString() === user.id;
  const isAdmin = user.role === "admin" || 'support_agent';

  return isOwner || isAssignedAgent || isAdmin;
};

// GET ALL ACTIVE TICKETS WITH FILTERING AND SEARCH
const getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, assignedAgentId, search } = req.query;

    // Validate query parameters
    if (
      status !== undefined &&
      (typeof status !== "string" || !validStatuses.includes(status))
    ) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      });
    }

    if (
      priority !== undefined &&
      (typeof priority !== "string" || !validPriorities.includes(priority))
    ) {
      return res.status(400).json({
        message: `Invalid priority. Valid priorities are: ${validPriorities.join(", ")}`,
      });
    }

    if (
      category !== undefined &&
      (typeof category !== "string" || !validCategories.includes(category))
    ) {
      return res.status(400).json({
        message: `Invalid category. Valid categories are: ${validCategories.join(", ")}`,
      });
    }

    if (
      assignedAgentId !== undefined &&
      (typeof assignedAgentId !== "string" || !isValidId(assignedAgentId))
    ) {
      return res.status(400).json({
        message: "Invalid assignedAgentId.",
      });
    }

    if (search !== undefined && typeof search !== "string") {
      return res.status(400).json({
        message: "Search must be a string.",
      });
    }

    // Build the MongoDB query
    const filter = {
      isDeleted: false,
    };

    // Apply optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Role-based ticket visibility
    if (req.user.role === "support_agent") {
      // Support agents can only retrieve tickets assigned to themselves.
      filter.assignedAgentId = req.user.id;
    } else if (assignedAgentId) {
      // Admins can filter tickets by any assigned agent.
      filter.assignedAgentId = assignedAgentId;
    }

    // Search ticket titles and descriptions
    if (search && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate("customerId", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Get all tickets error:", error);

    return res.status(500).json({
      message: "Failed to retrieve tickets.",
    });
  }
};

// GET ARCHIVED TICKETS
const getArchivedTickets = async (req, res) => {
  try {
    const archivedTickets = await Ticket.find({
      isDeleted: true,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(archivedTickets);
  } catch (error) {
    console.error("Get archived tickets error:", error);

    return res.status(500).json({
      message: "Failed to retrieve archived tickets.",
    });
  }
};

// GET A SINGLE TICKET
const getTicketById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !isValidId(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(id)
      .populate("customerId", "name email")
      .populate("assignedAgentId", "name email");

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this ticket.",
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Get ticket by ID error:", error);

    return res.status(500).json({
      message: "Failed to retrieve ticket.",
    });
  }
};

// GET COMMENTS BELONGING TO A TICKET
const getTicketComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId || !isValidId(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this ticket's comments.",
      });
    }

    const ticketComments = await Comment.find({
      ticketId: ticket._id,
    })
      .populate("authorId", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json(ticketComments);
  } catch (error) {
    console.error("Get ticket comments error:", error);

    return res.status(500).json({
      message: "Failed to retrieve ticket comments.",
    });
  }
};

// Create a comment on a ticket
const createComment = async (req, res) => {
  try {
    // 1. Get the ticket ID from the URL parameters
    const { ticketId } = req.params;

    // 2. Get the comment body from the request body
    const { body } = req.body;

    // 3. Get the author's ID from the authenticated user
    const authorId = req.user.id;

    // 4. Validate the ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID.",
      });
    }

    // 5. Validate the comment body
    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        message: "Comment body is required.",
      });
    }

    // 6. Find the ticket
    const ticket = await Ticket.findById(ticketId);

    // 7. Check whether the ticket exists
    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    // 8. Check whether the logged-in user can access this ticket
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({
        message: "You do not have permission to comment on this ticket.",
      });
    }

    // 9. Create and save the comment
    const comment = await Comment.create({
      ticketId: ticket._id,
      authorId,
      body: body.trim(),
    });

    // 10. Populate the author's details
    const populatedComment = await Comment.findById(comment._id).populate(
      "authorId",
      "name email role",
    );

    // 11. Return the created comment
    return res.status(201).json({
      message: "Comment created successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      message: "Failed to create comment.",
    });
  }
};

// GET TICKETS ASSIGNED TO AN AGENT
const getTicketsByAgentId = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    if (!agentId || !isValidId(agentId)) {
      return res.status(400).json({
        message: "Invalid agent ID",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isRequestingOwnTickets = agentId === req.user.id;

    if (!isRequestingOwnTickets && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: You don't have access to these tickets.",
      });
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "support_agent",
    });

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    const agentTickets = await Ticket.find({
      assignedAgentId: agentId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(agentTickets);
  } catch (error) {
    console.error("Get agent tickets error:", error);

    return res.status(500).json({
      message: "Failed to retrieve agent tickets.",
    });
  }
};

// CREATE A TICKET
const createTicket = async (req, res) => {
  try {
    // Get the customer ID from the authenticated user
    const customerId = req.user.id;

    const { title, description, priority, category } = req.body ?? {};

    // Validate required fields and their types
    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof priority !== "string" ||
      typeof category !== "string"
    ) {
      return res.status(400).json({
        message:
          "Title, description, priority, and category must be provided as strings.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({
        message: "Title and description cannot be empty.",
      });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Valid priorities are: ${validPriorities.join(", ")}`,
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Valid categories are: ${validCategories.join(", ")}`,
      });
    }

    // Check for a duplicate active ticket title belonging to this customer
    const duplicateTicket = await Ticket.findOne({
      customerId,
      title: {
        $regex: `^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      isDeleted: false,
    });

    if (duplicateTicket) {
      return res.status(409).json({
        message:
          "A ticket with the same title already exists for this customer.",
      });
    }

    // Create the ticket in MongoDB
    const newTicket = await Ticket.create({
      customerId,
      title: cleanTitle,
      description: cleanDescription,
      priority,
      category,
      status: "open",
      assignedAgentId: null,
      resolvedAt: null,
      closedAt: null,
      isDeleted: false,
      deletedAt: null,
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      message: "Failed to create ticket.",
    });
  }
};

// UPDATE A TICKET
const updateTicket = async (req, res) => {
  try {
    const id = req.params.ticketId;

    const { title, description, priority, category, status } = req.body ?? {};

    if (!id || !isValidId(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID. Please provide a valid ticket ID.",
      });
    }

    // Check whether at least one field was supplied
    const hasUpdate =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      category !== undefined ||
      status !== undefined;

    if (!hasUpdate) {
      return res.status(400).json({
        message: "At least one field is required for updating a ticket.",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignedSupportAgent =
      ticket.assignedAgentId?.toString() === req.user.id;

    if (!isAdmin && !isAssignedSupportAgent) {
      return res.status(403).json({
        message: "Forbidden: You don't have access to update this ticket.",
      });
    }

    // Validate title
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title must be a non-empty string.",
        });
      }
    }

    // Validate description
    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          message: "Description must be a non-empty string.",
        });
      }
    }

    // Validate priority
    if (
      priority !== undefined &&
      (typeof priority !== "string" || !validPriorities.includes(priority))
    ) {
      return res.status(400).json({
        message: `Invalid priority. Valid priorities are: ${validPriorities.join(", ")}`,
      });
    }

    // Validate category
    if (
      category !== undefined &&
      (typeof category !== "string" || !validCategories.includes(category))
    ) {
      return res.status(400).json({
        message: `Invalid category. Valid categories are: ${validCategories.join(", ")}`,
      });
    }

    // Validate status
    if (
      status !== undefined &&
      (typeof status !== "string" || !validStatuses.includes(status))
    ) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      });
    }

    // Apply the supplied updates
    if (title !== undefined) ticket.title = title.trim();
    if (description !== undefined) {
      ticket.description = description.trim();
    }
    if (priority !== undefined) ticket.priority = priority;
    if (category !== undefined) ticket.category = category;

    if (status !== undefined) {
      ticket.status = status;

      // Maintain resolution and closure dates
      if (status === "resolved") {
        ticket.resolvedAt = new Date();
        ticket.closedAt = null;
      } else if (status === "closed") {
        ticket.closedAt = new Date();

        if (!ticket.resolvedAt) {
          ticket.resolvedAt = new Date();
        }
      } else {
        ticket.resolvedAt = null;
        ticket.closedAt = null;
      }
    }

    await ticket.save();

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(500).json({
      message: "Failed to update ticket.",
    });
  }
};

// DELETE / ARCHIVE A TICKET
const deleteTicket = async (req, res) => {
  try {
    const id = req.params.ticketId;

    if (!id || !isValidId(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (ticket.isDeleted) {
      return res.status(409).json({
        message: "Ticket is already deleted",
      });
    }

    ticket.isDeleted = true;
    ticket.deletedAt = new Date();

    await ticket.save();

    return res.status(200).json({
      message: "Ticket deleted successfully",
      ticket,
    });
  } catch (error) {
    console.error("Delete ticket error:", error);

    return res.status(500).json({
      message: "Failed to delete ticket.",
    });
  }
};

// RESTORE A TICKET
const restoreTicket = async (req, res) => {
  try {
    const id = req.params.ticketId;

    if (!id || !isValidId(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (!ticket.isDeleted) {
      return res.status(409).json({
        message: "Ticket is not deleted",
      });
    }

    ticket.isDeleted = false;
    ticket.deletedAt = null;

    await ticket.save();

    return res.status(200).json({
      message: "Ticket restored successfully",
      ticket,
    });
  } catch (error) {
    console.error("Restore ticket error:", error);

    return res.status(500).json({
      message: "Failed to restore ticket.",
    });
  }
};

// ASSIGN A TICKET TO A SUPPORT AGENT
const assignTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const { assignedAgentId } = req.body ?? {};

    if (!ticketId || !isValidId(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    if (
      typeof assignedAgentId !== "string" ||
      !assignedAgentId.trim() ||
      !isValidId(assignedAgentId)
    ) {
      return res.status(400).json({
        message: "A valid assignedAgentId is required.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const agent = await User.findOne({
      _id: assignedAgentId,
      role: "support_agent",
    });

    if (!agent) {
      return res.status(404).json({
        message: "Support agent not found",
      });
    }

    if (agent.accountStatus !== "active") {
      return res.status(403).json({
        message: "The support agent's account is inactive",
      });
    }

    ticket.assignedAgentId = agent._id;

    await ticket.save();

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: {
        _id: ticket._id,
        assignedAgentId: ticket.assignedAgentId,
      },
    });
  } catch (error) {
    console.error("Assign ticket error:", error);

    return res.status(500).json({
      message: "Failed to assign ticket.",
    });
  }
};

// UNASSIGN A TICKET
const unassignTicket = async (req, res) => {
  try {
    const id = req.params.ticketId;

    if (!id || !isValidId(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (ticket.assignedAgentId === null) {
      return res.status(409).json({
        message: "Ticket is already unassigned",
      });
    }

    ticket.assignedAgentId = null;

    await ticket.save();

    return res.status(200).json({
      message: "Ticket unassigned successfully",
      ticket: {
        _id: ticket._id,
        assignedAgentId: ticket.assignedAgentId,
      },
    });
  } catch (error) {
    console.error("Unassign ticket error:", error);

    return res.status(500).json({
      message: "Failed to unassign ticket.",
    });
  }
};

export {
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
  createComment,
  unassignTicket,
};
