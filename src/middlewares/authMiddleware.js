import jwt from "jsonwebtoken";
import { users } from "../data/data.js";

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }

  if (!decoded || typeof decoded.id !== "string") {
    return res.status(401).json({
      message: "Invalid token payload.",
    });
  }

  // Find the current user
  const user = users.find((user) => user.id === decoded.id);

  if (!user) {
    return res.status(401).json({
      message: "User account no longer exists.",
    });
  }

  // Check current account status
  if (user.accountStatus !== "active") {
    return res.status(403).json({
      message: "Your account is inactive.",
    });
  }

  // Use the current role, not the potentially outdated JWT role
  req.user = {
    id: user.id,
    role: user.role,
  };

  next();
};

export default authenticateUser;
