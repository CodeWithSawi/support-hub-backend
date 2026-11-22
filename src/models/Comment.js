import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // The ticket this comment belongs to
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket ID is required"],
    },

    // The user who wrote the comment
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },

    // The actual comment
    body: {
      type: String,
      required: [true, "Comment body is required"],
      trim: true,
    },
  },
  {
    // Automatically manages createdAt and updatedAt
    timestamps: true,
  },
);

// Makes retrieving comments belonging to a ticket more efficient
commentSchema.index({ ticketId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
