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
    return res.status(404).json(agentTickets);
  }

  return res.status(200).json(agentTickets);
};

export { getAllTickets, getTicketById, getTicketComments, getTicketsByAgentId };
