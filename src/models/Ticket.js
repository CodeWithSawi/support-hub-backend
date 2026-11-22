import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // The customer who created the ticket
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },

    // Basic ticket information
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
    },

    // Ticket priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      required: [true, "Ticket priority is required"],
    },

    // Ticket category
    category: {
      type: String,
      enum: ["technical", "billing", "account", "general", "other"],
      required: [true, "Ticket category is required"],
    },

    // Current ticket status
    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "waiting_on_customer",
        "resolved",
        "closed",
      ],
      default: "open",
    },

    // The support agent assigned to the ticket
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Ticket resolution and closure dates
    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    // Soft deletion (archiving)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically creates createdAt and updatedAt
    timestamps: true,
  },
);

// Helpful indexes for common ticket queries
ticketSchema.index({ customerId: 1, isDeleted: 1 });
ticketSchema.index({ assignedAgentId: 1, isDeleted: 1 });
ticketSchema.index({ status: 1, priority: 1, category: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
