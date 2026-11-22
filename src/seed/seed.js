import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/dbConnect.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Comment from "../models/Comment.js";
import { hashPassword } from "../utils/passwordUtils.js";

// All accounts are fictional demo accounts.
const DEMO_PASSWORD = "SupportHubDemo2026!";

const customers = [
  "Abdul Kamara",
  "Mariama Sesay",
  "Ibrahim Koroma",
  "Fatmata Turay",
  "Mohamed Bangura",
  "Isata Conteh",
  "Alusine Kallon",
  "Hawa Mansaray",
  "Sorie Jalloh",
  "Adama Fornah",
  "Lansana Kargbo",
  "Kadiatu Kamara",
  "Josephine Tucker",
  "Amadu Sankoh",
  "Yabom Sillah",
  "Musa Bundu",
  "Tenneh Sesay",
  "Augustine Cole",
  "Ramatu Bah",
  "Patrick Fofanah",
  "Zainab Kanu",
  "Brima Dumbuya",
  "Kadie Rogers",
  "Sheku Tejan",
  "Aminata Jalloh",
  "Samuel Koroma",
  "Isatu Kamara",
  "Alimamy Sesay",
  "Mabinty Bangura",
  "Francis Caulker",
  "Hindolo Turay",
  "Jeneba Kallon",
  "Abu Bakarr Conteh",
  "Musu Mansaray",
  "Mohamed Lamin Jalloh",
  "Rebecca Williams",
  "Saidu Kargbo",
  "Finda Fornah",
  "Abdul Rahman Sesay",
  "Sia Nyallay",
  "Daniel Kanu",
  "Yatta Kamara",
  "Osman Bangura",
  "Memuna Koroma",
  "Alfred Sandy",
  "Haja Mariama Conteh",
  "Komba Sannoh",
  "Martha Macauley",
  "Bai Shebora",
  "Kadijatu Fofanah",
  "Mohamed Sorie Kamara",
  "Isata Marie Sesay",
  "Abdul Karim Turay",
  "Hawa Bockarie",
  "Sahr Lamin",
  "Yvonne Johnson",
  "Sorie Mohamed Kallon",
  "Fatmata Bintu Bah",
  "Ibrahim Sorie Bundu",
  "Mabinty Kargbo",
];

const agents = [
  "Abdul Aziz Sesay",
  "Esther Kamara",
  "Mohamed Jalloh",
  "Isatu Bangura",
  "Francis Kallon",
  "Hawa Conteh",
  "Sahr Koroma",
  "Mariatu Turay",
  "Joseph Fofanah",
  "Kadiatu Mansaray",
];

const admins = ["Michael Tucker", "Aminata Macauley"];

const locations = [
  "Freetown",
  "Bo",
  "Kenema",
  "Makeni",
  "Port Loko",
  "Waterloo",
  "Koidu",
  "Lunsar",
  "Mile 91",
  "Kabala",
  "Bonthe",
  "Kailahun",
];

const scenarios = [
  {
    title: "Unexpected charge on monthly account",
    category: "billing",
    priority: "high",
    description:
      "I noticed a charge on my latest statement that I do not recognise. Please help me understand it.",
  },
  {
    title: "Unable to sign in after password reset",
    category: "technical",
    priority: "high",
    description:
      "I reset my password successfully, but the sign-in page keeps rejecting my details.",
  },
  {
    title: "Request to update registered phone number",
    category: "account",
    priority: "medium",
    description:
      "I have changed my phone number and would like to update the number linked to my account.",
  },
  {
    title: "Dashboard takes a long time to load",
    category: "technical",
    priority: "medium",
    description:
      "The dashboard sometimes takes several minutes to load, especially when using a mobile connection.",
  },
  {
    title: "Payment confirmation not received",
    category: "billing",
    priority: "urgent",
    description:
      "My payment appears to have gone through, but I have not received a confirmation.",
  },
  {
    title: "Account verification still pending",
    category: "account",
    priority: "medium",
    description:
      "I submitted my verification information, but my account still shows verification pending.",
  },
  {
    title: "Need help understanding account features",
    category: "general",
    priority: "low",
    description:
      "I am new to the service and would appreciate guidance on the available account features.",
  },
  {
    title: "Error when saving profile changes",
    category: "technical",
    priority: "high",
    description:
      "Whenever I update my profile and select Save, an error appears and the changes are not stored.",
  },
  {
    title: "Request for a copy of previous invoice",
    category: "billing",
    priority: "low",
    description:
      "I need a copy of my previous invoice for my records but cannot find it in the dashboard.",
  },
  {
    title: "Intermittent connection to the service",
    category: "technical",
    priority: "urgent",
    description:
      "The service disconnects intermittently. I have tried again at different times, but the issue continues.",
  },
  {
    title: "Email address change request",
    category: "account",
    priority: "medium",
    description:
      "I no longer use the email address linked to my account and would like to update it.",
  },
  {
    title: "Question about service availability",
    category: "general",
    priority: "low",
    description:
      "Could you confirm which features are currently available in my area?",
  },
  {
    title: "Mobile page layout displays incorrectly",
    category: "technical",
    priority: "medium",
    description:
      "Some buttons and text overlap when I open the service on my mobile browser.",
  },
  {
    title: "Invoice details do not match payment record",
    category: "billing",
    priority: "high",
    description:
      "The amount shown on my invoice appears different from my payment confirmation.",
  },
  {
    title: "Account temporarily inaccessible",
    category: "account",
    priority: "urgent",
    description:
      "I am unable to access my account. Please check whether there is an issue with its status.",
  },
  {
    title: "Notifications are not arriving",
    category: "technical",
    priority: "medium",
    description:
      "I enabled notifications in my settings, but I am not receiving account updates.",
  },
  {
    title: "Payment appears twice in transaction history",
    category: "billing",
    priority: "urgent",
    description:
      "My transaction history appears to show the same payment twice. Please review it.",
  },
  {
    title: "Request for general assistance",
    category: "other",
    priority: "low",
    description:
      "I have a general enquiry about using the service and would appreciate assistance.",
  },
];

const commentMessages = [
  "Thank you for contacting Support Hub. We have received your request and are reviewing it.",
  "Could you please confirm when you first noticed the issue?",
  "I have checked the information provided and am investigating this with the relevant team.",
  "Thank you for the additional information. It helps us narrow down the cause.",
  "We have made an update on our side. Please try again and let us know whether the issue continues.",
  "I have shared this with the appropriate team and will update you when I receive feedback.",
  "The issue appears to be resolved now. Please confirm that everything is working as expected.",
  "Thanks for your patience. We appreciate you taking the time to report this.",
  "We are waiting for one more detail before we can complete the investigation.",
  "I have reviewed the account information and recorded the requested change.",
  "Thank you. The service is now responding normally.",
  "Your request is still being reviewed. We will provide another update soon.",
];

const statuses = [
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

// Generate a unique demo email address.
const makeEmail = (name, role, index) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, ".");

  return `${slug}.${role}${index + 1}@supporthub.test`;
};

// Generate dates in the past.
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9 + (days % 8), (days * 7) % 60, 0, 0);
  return date;
};

const seedDatabase = async () => {
  await connectDB();

  // Prevent accidental insertion into a database that already has data.
  const [userCount, ticketCount, commentCount] = await Promise.all([
    User.countDocuments(),
    Ticket.countDocuments(),
    Comment.countDocuments(),
  ]);

  if (ticketCount || commentCount) {
    throw new Error(
      `Tickets or comments already exist. Tickets: ${ticketCount}, Comments: ${commentCount}. Seeding cancelled.`,
    );
  }

  // ------------------------------------------------
  // 1. CREATE USERS
  // ------------------------------------------------

  console.log("Creating users...");

  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  const userRecords = [];

  customers.forEach((name, index) => {
    userRecords.push({
      name,
      email: makeEmail(name, "customer", index),
      password: hashedPassword,
      role: "customer",
      accountStatus: index % 17 === 0 ? "inactive" : "active",
    });
  });

  agents.forEach((name, index) => {
    userRecords.push({
      name,
      email: makeEmail(name, "agent", index),
      password: hashedPassword,
      role: "support_agent",
      accountStatus: "active",
    });
  });

  admins.forEach((name, index) => {
    userRecords.push({
      name,
      email: makeEmail(name, "admin", index),
      password: hashedPassword,
      role: "admin",
      accountStatus: "active",
    });
  });

  const createdUsers = await User.insertMany(userRecords);

  const customerUsers = createdUsers.filter((user) => user.role === "customer");

  const agentUsers = createdUsers.filter(
    (user) => user.role === "support_agent",
  );

  const adminUsers = createdUsers.filter((user) => user.role === "admin");

  console.log(`Created ${createdUsers.length} users.`);

  // ------------------------------------------------
  // 2. CREATE TICKETS
  // ------------------------------------------------

  console.log("Creating tickets...");

  const ticketRecords = [];

  for (let i = 0; i < 180; i++) {
    const customer = customerUsers[i % customerUsers.length];
    const agent = agentUsers[i % agentUsers.length];
    const scenario = scenarios[i % scenarios.length];
    const status = statuses[i % statuses.length];

    const createdAt = daysAgo((i * 3) % 90);
    const isDeleted = i % 29 === 0;

    ticketRecords.push({
      customerId: customer._id,

      title: `${scenario.title} - ${i + 1}`,

      description: `${scenario.description}\n\nCustomer location: ${locations[i % locations.length]}.`,

      priority: scenario.priority,
      category: scenario.category,
      status,

      assignedAgentId: i % 7 === 0 ? null : agent._id,

      resolvedAt: ["resolved", "closed"].includes(status)
        ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000)
        : null,

      closedAt:
        status === "closed"
          ? new Date(createdAt.getTime() + 4 * 60 * 60 * 1000)
          : null,

      isDeleted,

      deletedAt: isDeleted
        ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
        : null,

      createdAt,
      updatedAt: new Date(createdAt.getTime() + 6 * 60 * 60 * 1000),
    });
  }

  const createdTickets = await Ticket.insertMany(ticketRecords);

  console.log(`Created ${createdTickets.length} tickets.`);

  // ------------------------------------------------
  // 3. CREATE COMMENTS
  // ------------------------------------------------

  console.log("Creating comments...");

  const commentRecords = [];

  createdTickets.forEach((ticket, index) => {
    const customer = customerUsers.find(
      (user) => user._id.toString() === ticket.customerId.toString(),
    );

    const agent = ticket.assignedAgentId
      ? agentUsers.find(
          (user) => user._id.toString() === ticket.assignedAgentId.toString(),
        )
      : agentUsers[index % agentUsers.length];

    const admin = adminUsers[index % adminUsers.length];

    const authors = [customer, agent, admin];

    for (let j = 0; j < 3; j++) {
      const createdAt = new Date(
        ticket.createdAt.getTime() + (j + 1) * 45 * 60 * 1000,
      );

      commentRecords.push({
        ticketId: ticket._id,
        authorId: authors[j]._id,
        body: commentMessages[(index + j) % commentMessages.length],
        createdAt,
        updatedAt: createdAt,
      });
    }
  });

  const createdComments = await Comment.insertMany(commentRecords);

  console.log(`Created ${createdComments.length} comments.`);

  // ------------------------------------------------
  // 4. DISPLAY SUMMARY
  // ------------------------------------------------

  console.log("\nDatabase seeding completed!");
  console.log("--------------------------------");
  console.log(`Total users: ${createdUsers.length}`);
  console.log(`Customers: ${customerUsers.length}`);
  console.log(`Support agents: ${agentUsers.length}`);
  console.log(`Administrators: ${adminUsers.length}`);
  console.log(`Tickets: ${createdTickets.length}`);
  console.log(`Comments: ${createdComments.length}`);
  console.log("--------------------------------");
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log("Demo emails use the reserved .test domain.");
};

try {
  await seedDatabase();
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
