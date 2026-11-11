import { users } from "../data/data.js";

const getAllUsers = (req, res) => {
  res.json(users);
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

  res.json(user);
};

export { getAllUsers, getUserById };
