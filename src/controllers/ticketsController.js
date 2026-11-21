import { users, tickets, comments } from "../data/data.js";

const getCurrentDate = () => new Date().toISOString();

const validPriorities = ["low", "medium", "high", "urgent"];

const validCategories = ["technical", "billing", "account", "general", "other"];

const validStatuses = [
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

// GET ALL ACTIVE TICKETS WITH FILTERING AND SEARCH
const getAllTickets = (req, res) => {
  const activeTickets = tickets.filter((ticket) => !ticket.isDeleted);

  const { status, priority, category, assignedAgentId, search } = req.query;

  let filtered = activeTickets;

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

  if (assignedAgentId !== undefined && typeof assignedAgentId !== "string") {
    return res.status(400).json({
      message: "Invalid assignedAgentId.",
    });
  }

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      message: "Search must be a string.",
    });
  }

  // Apply filters
  if (status) {
    filtered = filtered.filter((ticket) => ticket.status === status);
  }

  if (priority) {
    filtered = filtered.filter((ticket) => ticket.priority === priority);
  }

  if (category) {
    filtered = filtered.filter((ticket) => ticket.category === category);
  }

  if (assignedAgentId) {
    filtered = filtered.filter(
      (ticket) => ticket.assignedAgentId === assignedAgentId,
    );
  }

  // Apply search
  if (search && search.trim()) {
    const query = search.trim().toLowerCase();

    filtered = filtered.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query),
    );
  }

  return res.status(200).json(filtered);
};

// GET ARCHIVED TICKETS
const getArchivedTickets = (req, res) => {
  const archivedTickets = tickets.filter((ticket) => ticket.isDeleted);

  return res.status(200).json(archivedTickets);
};

// GET A SINGLE TICKET
const getTicketById = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = tickets.find((ticket) => ticket.id === id);

  if (!ticket || ticket.isDeleted) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  const user = req.user;

  const isOwner = ticket.customerId === user.id;
  const isAssignedAgent = ticket.assignedAgentId === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedAgent && !isAdmin) {
    return res.status(403).json({
      message: "Forbidden: You do not have access to this ticket.",
    });
  }

  return res.status(200).json(ticket);
};

// GET COMMENTS BELONGING TO A TICKET
const getTicketComments = (req, res) => {
  const ticketId = req.params.ticketId;

  if (!ticketId) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket || ticket.isDeleted) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  const user = req.user;

  const isOwner = ticket.customerId === user.id;
  const isAssignedAgent = ticket.assignedAgentId === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedAgent && !isAdmin) {
    return res.status(403).json({
      message: "Forbidden: You do not have access to this ticket's comments.",
    });
  }

  const ticketComments = comments.filter(
    (comment) => comment.ticketId === ticketId,
  );

  return res.status(200).json(ticketComments);
};

// GET TICKETS ASSIGNED TO AN AGENT
const getTicketsByAgentId = (req, res) => {
  const agentId = req.params.agentId;

  if (!agentId) {
    return res.status(400).json({
      message: "Invalid agent ID",
    });
  }

  const user = req.user;

  const isAdmin = user.role === "admin";
  const isRequestingOwnTickets = agentId === user.id;

  if (!isRequestingOwnTickets && !isAdmin) {
    return res.status(403).json({
      message: "Forbidden: You don't have access to these tickets.",
    });
  }

  const agent = users.find(
    (user) => user.id === agentId && user.role === "support_agent",
  );

  if (!agent) {
    return res.status(404).json({
      message: "Agent not found",
    });
  }

  const agentTickets = tickets.filter(
    (ticket) => ticket.assignedAgentId === agentId && !ticket.isDeleted,
  );

  return res.status(200).json(agentTickets);
};

// CREATE A TICKET
const createTicket = (req, res) => {
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

  // Check for duplicate active ticket title belonging to this customer
  const duplicateTicket = tickets.find(
    (ticket) =>
      ticket.customerId === customerId &&
      ticket.title.toLowerCase() === cleanTitle.toLowerCase() &&
      !ticket.isDeleted,
  );

  if (duplicateTicket) {
    return res.status(409).json({
      message: "A ticket with the same title already exists for this customer.",
    });
  }

  // Generate ticket ID
  const lastTicket = tickets[tickets.length - 1];

  const newId = lastTicket ? `t${Number(lastTicket.id.slice(1)) + 1}` : "t1001";

  const timestamp = getCurrentDate();

  const newTicket = {
    id: newId,
    customerId,
    title: cleanTitle,
    description: cleanDescription,
    priority,
    category,
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
    assignedAgentId: null,
    resolvedAt: null,
    closedAt: null,
    isDeleted: false,
    deletedAt: null,
  };

  tickets.push(newTicket);

  return res.status(201).json(newTicket);
};

// UPDATE A TICKET
const updateTicket = (req, res) => {
  const id = req.params.ticketId;

  const { title, description, priority, category, status } = req.body ?? {};

  if (!id) {
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

  const ticket = tickets.find((ticket) => ticket.id === id);

  if (!ticket || ticket.isDeleted) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  const user = req.user;

  const isAdmin = user.role === "admin";
  const isAssignedSupportAgent = ticket.assignedAgentId === user.id;

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

  // Apply updates
  if (title !== undefined) ticket.title = title.trim();
  if (description !== undefined) ticket.description = description.trim();
  if (priority !== undefined) ticket.priority = priority;
  if (category !== undefined) ticket.category = category;
  if (status !== undefined) ticket.status = status;

  ticket.updatedAt = getCurrentDate();

  return res.status(200).json(ticket);
};

// DELETE / ARCHIVE A TICKET
const deleteTicket = (req, res) => {
  const id = req.params.ticketId;

  if (!id) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = tickets.find((ticket) => ticket.id === id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.isDeleted) {
    return res.status(409).json({
      message: "Ticket is already deleted",
    });
  }

  const timestamp = getCurrentDate();

  ticket.isDeleted = true;
  ticket.deletedAt = timestamp;
  ticket.updatedAt = timestamp;

  return res.status(200).json({
    message: "Ticket deleted successfully",
    ticket,
  });
};

// RESTORE A TICKET
const restoreTicket = (req, res) => {
  const id = req.params.ticketId;

  if (!id) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = tickets.find((ticket) => ticket.id === id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!ticket.isDeleted) {
    return res.status(409).json({
      message: "Ticket is not deleted",
    });
  }

  ticket.isDeleted = false;
  ticket.deletedAt = null;
  ticket.updatedAt = getCurrentDate();

  return res.status(200).json({
    message: "Ticket restored successfully",
    ticket,
  });
};

// ASSIGN A TICKET TO A SUPPORT AGENT
const assignTicket = (req, res) => {
  const ticketId = req.params.ticketId;
  const { assignedAgentId } = req.body ?? {};

  if (!ticketId) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  if (typeof assignedAgentId !== "string" || !assignedAgentId.trim()) {
    return res.status(400).json({
      message: "A valid assignedAgentId is required.",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket || ticket.isDeleted) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  const agent = users.find(
    (user) => user.id === assignedAgentId && user.role === "support_agent",
  );

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

  ticket.assignedAgentId = assignedAgentId;
  ticket.updatedAt = getCurrentDate();

  return res.status(200).json({
    message: "Ticket assigned successfully",
    ticket: {
      id: ticket.id,
      assignedAgentId: ticket.assignedAgentId,
    },
  });
};

// UNASSIGN A TICKET
const unassignTicket = (req, res) => {
  const id = req.params.ticketId;

  if (!id) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === id);

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
  ticket.updatedAt = getCurrentDate();

  return res.status(200).json({
    message: "Ticket unassigned successfully",
    ticket: {
      id: ticket.id,
      assignedAgentId: ticket.assignedAgentId,
    },
  });
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
  unassignTicket,
};
