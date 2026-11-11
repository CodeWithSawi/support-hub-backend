import { users, tickets, comments } from "../data/data.js";

const getAllTickets = (req, res) => {
  res.status(200).json(tickets);
};

const getTicketById = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = tickets.find((ticket) => id === ticket.id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  return res.status(200).json(ticket);
};

const getTicketComments = (req, res) => {
  const ticketId = req.params.ticketId;

  if (!ticketId) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  // Check if the ticket exists
  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  // Find all comments belonging to this ticket
  const ticketComments = comments.filter(
    (comment) => comment.ticketId === ticketId,
  );

  if (ticketComments.length === 0) {
    return res.status(404).json({
      message: "No comments found for this ticket",
    });
  }

  return res.status(200).json(ticketComments);
};

const getTicketsByAgentId = (req, res) => {
  const agentId = req.params.agentId;

  if (!agentId) {
    return res.status(400).json({ message: "Invalid agent ID" });
  }

  const agent = users.find(
    (user) => user.id === agentId && user.role === "support_agent",
  );

  if (!agent) {
    return res.status(404).json({ message: "Agent not found" });
  }

  const agentTickets = tickets.filter(
    (ticket) => ticket.assignedAgentId === agentId,
  );

  if (agentTickets.length === 0) {
    return res.status(404).json({ message: "No tickets found for this agent" });
  }

  return res.status(200).json(agentTickets);
};

const createTicket = (req, res) => {
  // Destructure the required fields from the request body
  const { customerId, title, description, priority, category } = req.body;

  if (!title || !description || !priority || !category || !customerId) {
    return res
      .status(400)
      .json({ message: "Missing required fields. All fields are required." });
  }
  // Find the customer
  const customer = users.find(
    (user) => user.id === customerId && user.role === "customer",
  );

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const validPriorities = ["low", "medium", "high", "urgent"];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      message: `Invalid priority. Valid priorities are: ${validPriorities.join(
        ", ",
      )}`,
    });
  }

  const validCategories = [
    "technical",
    "billing",
    "account",
    "general",
    "other",
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      message: `Invalid category. Valid categories are: ${validCategories.join(
        ", ",
      )}`,
    });
  }

  // Check for duplicate ticket title for the same customer
  const duplicateTicket = tickets.find(
    (ticket) => ticket.customerId === customerId && ticket.title === title,
  );

  if (duplicateTicket) {
    return res.status(409).json({
      message: "A ticket with the same title already exists for this customer.",
    });
  }

  // Generate a new ticket ID based on the last ticket's ID
  const lastTicket = tickets[tickets.length - 1];
  const newId = lastTicket ? `t${+lastTicket.id.slice(1) + 1}` : "t1001";
  const currentDate = new Date().toISOString();

  // Create a new ticket object
  const newTicket = {
    id: newId,
    customerId,
    title,
    description,
    priority,
    category,
    status: "open",
    createdAt: currentDate,
    updatedAt: currentDate,
    assignedAgentId: null,
    resolvedAt: null,
    closedAt: null,
  };

  // Add the new ticket to the tickets array
  tickets.push(newTicket);

  // Return the newly created ticket
  return res.status(201).json(newTicket);
};

export {
  getAllTickets,
  getTicketById,
  getTicketComments,
  getTicketsByAgentId,
  createTicket,
};
