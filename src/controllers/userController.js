import User from "../models/User.js";

// Allowed roles and account statuses
const validRoles = ["customer", "support_agent", "admin"];
const validStatuses = ["active", "inactive"];

// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users from MongoDB.
    // -password excludes the password field from the results.
    const users = await User.find().select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve users.",
    });
  }
};

// ==========================================
// GET USER BY ID
// ==========================================
const getUserById = async (req, res) => {
  try {
    // Get the MongoDB document ID from the URL parameters.
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find the user using their MongoDB _id.
    // Exclude the password field from the result.
    const user = await User.findById(id).select("-password");

    // Check whether the user exists.
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check whether the requester is accessing their own profile.
    const isOwnProfile = req.user.id === user._id.toString();

    // Check whether the requester is an admin.
    const isAdmin = req.user.role === "admin";

    // Only the user themselves or an admin can access this profile.
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: You cannot access this user's information.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    // Mongoose can throw a CastError if the supplied ID is invalid.
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID format.",
      });
    }

    console.error("Error retrieving user:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve user.",
    });
  }
};

// ==========================================
// UPDATE USER ROLE
// ==========================================
const updateUsersRole = async (req, res) => {
  try {
    // Get the user ID from the URL.
    const id = req.params.id;

    // Get the new role from the request body.
    const { role } = req.body ?? {};

    if (!id) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Validate the supplied role.
    if (typeof role !== "string" || !validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
      });
    }

    // Prevent an admin from changing their own role.
    if (req.user.id === id) {
      return res.status(403).json({
        message: "You cannot update your own role.",
      });
    }

    // Find the user before updating.
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update the role on the Mongoose document.
    user.role = role;

    // Save the changes permanently to MongoDB.
    await user.save();

    // Exclude the password from the response.
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      message: "User role updated successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID format.",
      });
    }

    console.error("Error updating user role:", error.message);

    return res.status(500).json({
      message: "Failed to update user role.",
    });
  }
};

// ==========================================
// UPDATE ACCOUNT STATUS
// ==========================================
const updateAccountStatus = async (req, res) => {
  try {
    // Get the user ID from the URL.
    const id = req.params.id;

    // Get the new account status from the request body.
    const { accountStatus } = req.body ?? {};

    if (!id) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Validate the account status.
    if (
      typeof accountStatus !== "string" ||
      !validStatuses.includes(accountStatus)
    ) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      });
    }

    // Find the user in MongoDB.
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent an admin from deactivating their own account.
    if (req.user.id === user._id.toString() && accountStatus === "inactive") {
      return res.status(403).json({
        message: "You cannot deactivate your own account.",
      });
    }

    // Update the account status.
    user.accountStatus = accountStatus;

    // Save the updated document to MongoDB.
    await user.save();

    // Retrieve the updated user without the password.
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      message: "User status updated successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID format.",
      });
    }

    console.error("Error updating account status:", error.message);

    return res.status(500).json({
      message: "Failed to update account status.",
    });
  }
};

// Export all controller functions.
export { getAllUsers, getUserById, updateUsersRole, updateAccountStatus };
