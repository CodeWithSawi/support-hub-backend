import { users } from "../data/data.js";

const validRoles = ["customer", "support_agent", "admin"];
const validStatuses = ["active", "inactive"];

const getCurrentDate = () => new Date().toISOString();

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

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isOwnProfile = req.user.id === id;
  const isAdmin = req.user.role === "admin";

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
  const { role } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (typeof role !== "string" || !validRoles.includes(role)) {
    return res.status(400).json({
      message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
    });
  }

  if (req.user.id === id) {
    return res.status(403).json({
      message: "You cannot update your own role.",
    });
  }

  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  user.updatedAt = getCurrentDate();

  const { password, ...safeUser } = user;

  return res.status(200).json({
    message: "User role updated successfully",
    user: safeUser,
  });
};

const updateAccountStatus = (req, res) => {
  const id = req.params.id;
  const { accountStatus } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (
    typeof accountStatus !== "string" ||
    !validStatuses.includes(accountStatus)
  ) {
    return res.status(400).json({
      message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
    });
  }

  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.user.id === id && accountStatus === "inactive") {
    return res.status(403).json({
      message: "You cannot deactivate your own account.",
    });
  }

  user.accountStatus = accountStatus;
  user.updatedAt = getCurrentDate();

  const { password, ...safeUser } = user;

  return res.status(200).json({
    message: "User status updated successfully",
    user: safeUser,
  });
};

export { getAllUsers, getUserById, updateUsersRole, updateAccountStatus };
