import { users, tickets, comments } from "../data/data.js";

const getDashboardStats = (req, res) => {
  const activeTickets = tickets.filter((ticket) => !ticket.isDeleted);

  const initialStats = {
    open: 0,
    inProgress: 0,
    waitingOnCustomer: 0,
    resolved: 0,
    closed: 0,
  };

  const ticketStats = activeTickets.reduce((acc, ticket) => {
    if (ticket.status === "open") acc.open++;
    else if (ticket.status === "closed") acc.closed++;
    else if (ticket.status === "in_progress") acc.inProgress++;
    else if (ticket.status === "waiting_on_customer") acc.waitingOnCustomer++;
    else if (ticket.status === "resolved") acc.resolved++;

    return acc;
  }, initialStats);

  const totalTickets = activeTickets.length;

  const activeUsers = users.filter((user) => !user.isDeleted);

  const initialUsersStats = {
    customers: 0,
    supportAgents: 0,
    admin: 0,
    active: 0,
    inactive: 0,
  };

  const userStats = users.reduce((acc, user) => {
    if (user.role === "customer") acc.customers++;
    else if (user.role === "support_agent") acc.supportAgents++;
    else if (user.role === "admin") acc.admin++;

    if (user.accountStatus === "active") acc.active++;
    else if (user.accountStatus === "inactive") acc.inactive++;

    return acc;
  }, initialUsersStats);

  const totalUsers = users.length;

  return res.status(200).json({
    tickets: {
      total: totalTickets,
      ...ticketStats,
    },
    users: {
      total: totalUsers,
      ...userStats,
    },
  });
};

export { getDashboardStats };
