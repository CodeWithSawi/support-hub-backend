import { users } from "../data/data.js";

const validRoles = ["customer", "support_agent", "admin"];
const validStatuses = ["active", "inactive"];

const getAllUsers = (req, res) => {
  const safeUsers = users.map(({ password, ...user }) => user);

  return res.status(200).json(safeUsers);
};

const getUserById = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = users.find((user) => user.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const loggedUser = req.user;
  const isOwnProfile = loggedUser.id === id;
  const isAdmin = loggedUser.role === "admin";

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({
      message: "Forbidden: You cannot access this user's information.",
    });
  }

  const { password, ...safeUser } = user;

  return res.status(200).json(safeUser);
};

const updateUsersRole = (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  // Validate user ID
  if (!id) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  // Validate the new role
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
    });
  }

  // Find the user
  const user = users.find((user) => user.id === id);

  // Check whether the user exists
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Update the user's role
  user.role = role;

  // Exclude password from response
  const { password, ...safeUser } = user;

  // Return success response
  return res.status(200).json({
    message: "User role updated successfully",
    user: safeUser,
  });
};

const updateAccountStatus = (req, res) => {
  const id = req.params.id;
  const { accountStatus } = req.body;

  if (!id) return res.status(400).json({ message: "Invalid user ID" });

  if (!validStatuses.includes(accountStatus))
    return res.status(400).json({
      message: `Invalid status. Valid statuses are: ${validStatuses.join(",")}`,
    });

  const user = users.find((user) => user.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.accountStatus = accountStatus;

  const { password, ...safeUser } = user;

  return res
    .status(200)
    .json({ message: "User status updated successfully", user: safeUser });
};

export { getAllUsers, getUserById, updateUsersRole, updateAccountStatus };
