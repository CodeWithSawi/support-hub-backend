const users = [
  // CUSTOMERS
  {
    id: "u1",
    name: "John Kamara",
    email: "john.kamara@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-20T09:00:00.000Z",
    updatedAt: "2026-10-20T09:00:00.000Z",
  },
  {
    id: "u2",
    name: "Mary Johnson",
    email: "mary.johnson@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-21T10:15:00.000Z",
    updatedAt: "2026-10-21T10:15:00.000Z",
  },
  {
    id: "u3",
    name: "David Williams",
    email: "david.williams@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-22T11:30:00.000Z",
    updatedAt: "2026-10-22T11:30:00.000Z",
  },
  {
    id: "u4",
    name: "Sarah Conteh",
    email: "sarah.conteh@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-23T08:45:00.000Z",
    updatedAt: "2026-10-23T08:45:00.000Z",
  },
  {
    id: "u5",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-24T12:00:00.000Z",
    updatedAt: "2026-10-24T12:00:00.000Z",
  },
  {
    id: "u6",
    name: "Fatmata Kamara",
    email: "fatmata.kamara@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-25T14:20:00.000Z",
    updatedAt: "2026-10-25T14:20:00.000Z",
  },
  {
    id: "u7",
    name: "Daniel Smith",
    email: "daniel.smith@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-26T09:40:00.000Z",
    updatedAt: "2026-10-26T09:40:00.000Z",
  },
  {
    id: "u8",
    name: "Aminata Sesay",
    email: "aminata.sesay@example.com",
    role: "customer",
    accountStatus: "active",
    createdAt: "2026-10-27T15:10:00.000Z",
    updatedAt: "2026-10-27T15:10:00.000Z",
  },

  // SUPPORT AGENTS
  {
    id: "u9",
    name: "Robert Taylor",
    email: "robert@techworld.example",
    role: "support_agent",
    accountStatus: "active",
    createdAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-15T08:00:00.000Z",
  },
  {
    id: "u10",
    name: "Grace Williams",
    email: "grace@techworld.example",
    role: "support_agent",
    accountStatus: "active",
    createdAt: "2026-10-15T08:30:00.000Z",
    updatedAt: "2026-10-15T08:30:00.000Z",
  },
  {
    id: "u11",
    name: "Peter Johnson",
    email: "peter@techworld.example",
    role: "support_agent",
    accountStatus: "active",
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-15T09:00:00.000Z",
  },

  // ADMINISTRATOR
  {
    id: "u12",
    name: "Admin User",
    email: "admin@techworld.example",
    role: "admin",
    accountStatus: "active",
    createdAt: "2026-10-10T08:00:00.000Z",
    updatedAt: "2026-10-10T08:00:00.000Z",
  },
];

const tickets = [
  {
    id: "t1001",
    title: "Laptop Wi-Fi connection problem",
    description:
      "My laptop cannot connect to my home Wi-Fi network, although my phone connects without any problems.",
    customerId: "u1",
    assignedAgentId: "u9",
    status: "in_progress",
    priority: "high",
    category: "technical_support",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-02T10:30:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1002",
    title: "Unable to install software",
    description:
      "I am trying to install a required application, but the installation keeps failing.",
    customerId: "u2",
    assignedAgentId: "u10",
    status: "waiting_on_customer",
    priority: "medium",
    category: "software",
    createdAt: "2026-11-01T10:15:00.000Z",
    updatedAt: "2026-11-03T11:00:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1003",
    title: "Laptop overheating",
    description:
      "My laptop becomes very hot after a few minutes of use, even when I am not running demanding applications.",
    customerId: "u3",
    assignedAgentId: "u11",
    status: "in_progress",
    priority: "urgent",
    category: "hardware",
    createdAt: "2026-11-02T08:30:00.000Z",
    updatedAt: "2026-11-03T09:15:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1004",
    title: "Question about support service charges",
    description:
      "I would like to understand the charges associated with a recent support service.",
    customerId: "u4",
    assignedAgentId: null,
    status: "open",
    priority: "low",
    category: "billing",
    createdAt: "2026-11-03T12:00:00.000Z",
    updatedAt: "2026-11-03T12:00:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1005",
    title: "Laptop battery draining quickly",
    description:
      "My laptop battery drains much faster than it used to, even when I only browse the internet.",
    customerId: "u5",
    assignedAgentId: "u9",
    status: "waiting_on_customer",
    priority: "high",
    category: "hardware",
    createdAt: "2026-11-04T09:20:00.000Z",
    updatedAt: "2026-11-05T14:00:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1006",
    title: "Cannot access my account",
    description:
      "I am having trouble accessing my account and need assistance restoring access.",
    customerId: "u6",
    assignedAgentId: "u10",
    status: "resolved",
    priority: "urgent",
    category: "account_access",
    createdAt: "2026-11-04T11:45:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
    resolvedAt: "2026-11-06T10:00:00.000Z",
    closedAt: null,
  },
  {
    id: "t1007",
    title: "Laptop screen flickering",
    description:
      "My laptop screen randomly flickers when I open certain applications.",
    customerId: "u7",
    assignedAgentId: "u11",
    status: "in_progress",
    priority: "high",
    category: "hardware",
    createdAt: "2026-11-05T08:00:00.000Z",
    updatedAt: "2026-11-06T09:30:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1008",
    title: "Request for software recommendations",
    description:
      "I need recommendations for reliable productivity software for my laptop.",
    customerId: "u8",
    assignedAgentId: null,
    status: "open",
    priority: "low",
    category: "software",
    createdAt: "2026-11-06T13:30:00.000Z",
    updatedAt: "2026-11-06T13:30:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1009",
    title: "Slow laptop performance",
    description:
      "My laptop takes a long time to start and applications are running slowly.",
    customerId: "u1",
    assignedAgentId: "u10",
    status: "closed",
    priority: "medium",
    category: "technical_support",
    createdAt: "2026-11-07T08:15:00.000Z",
    updatedAt: "2026-11-09T16:00:00.000Z",
    resolvedAt: "2026-11-09T12:00:00.000Z",
    closedAt: "2026-11-09T16:00:00.000Z",
  },
  {
    id: "t1010",
    title: "Operating system update failure",
    description:
      "My laptop repeatedly fails to complete an operating system update.",
    customerId: "u2",
    assignedAgentId: "u9",
    status: "open",
    priority: "medium",
    category: "software",
    createdAt: "2026-11-08T10:00:00.000Z",
    updatedAt: "2026-11-08T10:00:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1011",
    title: "External keyboard not working",
    description:
      "My external keyboard is connected to the laptop but does not respond to key presses.",
    customerId: "u3",
    assignedAgentId: "u11",
    status: "waiting_on_customer",
    priority: "medium",
    category: "hardware",
    createdAt: "2026-11-09T09:45:00.000Z",
    updatedAt: "2026-11-10T11:00:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: "t1012",
    title: "Request for technical assistance",
    description:
      "I need help understanding how to back up important files on my laptop.",
    customerId: "u4",
    assignedAgentId: null,
    status: "open",
    priority: "low",
    category: "technical_support",
    createdAt: "2026-11-10T08:30:00.000Z",
    updatedAt: "2026-11-10T08:30:00.000Z",
    resolvedAt: null,
    closedAt: null,
  },
];

const comments = [
  // TICKET t1001
  {
    id: "c1",
    ticketId: "t1001",
    authorId: "u1",
    body: "My laptop cannot detect my home Wi-Fi network. Please help.",
    createdAt: "2026-11-01T09:15:00.000Z",
  },
  {
    id: "c2",
    ticketId: "t1001",
    authorId: "u9",
    body: "Thanks for reporting this. Have you tried restarting your laptop and router?",
    createdAt: "2026-11-01T10:00:00.000Z",
  },

  // TICKET t1002
  {
    id: "c3",
    ticketId: "t1002",
    authorId: "u2",
    body: "The installation stops halfway and displays an error message.",
    createdAt: "2026-11-01T10:30:00.000Z",
  },
  {
    id: "c4",
    ticketId: "t1002",
    authorId: "u10",
    body: "Could you share the exact error message displayed during installation?",
    createdAt: "2026-11-01T11:00:00.000Z",
  },

  // TICKET t1003
  {
    id: "c5",
    ticketId: "t1003",
    authorId: "u3",
    body: "The laptop gets extremely hot even when I only browse the internet.",
    createdAt: "2026-11-02T08:45:00.000Z",
  },
  {
    id: "c6",
    ticketId: "t1003",
    authorId: "u11",
    body: "We are investigating the issue. Please let us know whether the cooling fan is making unusual noise.",
    createdAt: "2026-11-02T09:30:00.000Z",
  },

  // TICKET t1004
  {
    id: "c7",
    ticketId: "t1004",
    authorId: "u4",
    body: "I would like a breakdown of the charges on my recent support request.",
    createdAt: "2026-11-03T12:15:00.000Z",
  },

  // TICKET t1005
  {
    id: "c8",
    ticketId: "t1005",
    authorId: "u5",
    body: "My battery percentage drops very quickly even when I am not running many applications.",
    createdAt: "2026-11-04T09:45:00.000Z",
  },
  {
    id: "c9",
    ticketId: "t1005",
    authorId: "u9",
    body: "Please let us know how long your battery normally lasts after a full charge.",
    createdAt: "2026-11-04T10:30:00.000Z",
  },

  // TICKET t1006
  {
    id: "c10",
    ticketId: "t1006",
    authorId: "u6",
    body: "I cannot log into my account despite entering the correct credentials.",
    createdAt: "2026-11-04T12:00:00.000Z",
  },
  {
    id: "c11",
    ticketId: "t1006",
    authorId: "u10",
    body: "We have helped you restore access. Please try signing in again.",
    createdAt: "2026-11-06T09:45:00.000Z",
  },

  // TICKET t1007
  {
    id: "c12",
    ticketId: "t1007",
    authorId: "u7",
    body: "The screen flickers whenever I open certain applications.",
    createdAt: "2026-11-05T08:20:00.000Z",
  },
  {
    id: "c13",
    ticketId: "t1007",
    authorId: "u11",
    body: "Does the flickering happen with every application or only specific ones?",
    createdAt: "2026-11-05T09:00:00.000Z",
  },

  // TICKET t1008
  {
    id: "c14",
    ticketId: "t1008",
    authorId: "u8",
    body: "I would appreciate some recommendations for productivity applications.",
    createdAt: "2026-11-06T13:45:00.000Z",
  },

  // TICKET t1009
  {
    id: "c15",
    ticketId: "t1009",
    authorId: "u1",
    body: "My laptop has become very slow, especially during startup.",
    createdAt: "2026-11-07T08:30:00.000Z",
  },
  {
    id: "c16",
    ticketId: "t1009",
    authorId: "u10",
    body: "We have completed the recommended performance improvements. Please check whether startup is faster now.",
    createdAt: "2026-11-09T11:30:00.000Z",
  },

  // TICKET t1010
  {
    id: "c17",
    ticketId: "t1010",
    authorId: "u2",
    body: "The operating system update keeps failing whenever I try to install it.",
    createdAt: "2026-11-08T10:15:00.000Z",
  },

  // TICKET t1011
  {
    id: "c18",
    ticketId: "t1011",
    authorId: "u3",
    body: "My external keyboard is connected, but none of the keys are responding.",
    createdAt: "2026-11-09T10:00:00.000Z",
  },
  {
    id: "c19",
    ticketId: "t1011",
    authorId: "u11",
    body: "Could you try connecting the keyboard to another USB port and let us know what happens?",
    createdAt: "2026-11-09T10:30:00.000Z",
  },

  // TICKET t1012
  {
    id: "c20",
    ticketId: "t1012",
    authorId: "u4",
    body: "I need guidance on how to back up my important documents and files.",
    createdAt: "2026-11-10T08:45:00.000Z",
  },
];

export { users, tickets, comments };
