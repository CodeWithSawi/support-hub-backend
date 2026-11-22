import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticateUser = async (req, res, next) => {
  // 1. Get the authorization header
  const authHeader = req.headers.authorization;

  // 2. Check whether the token was provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  // 3. Extract the token
  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  // 4. Verify the token
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }

  // 5. Validate the token payload
  if (!decoded || typeof decoded.id !== "string") {
    return res.status(401).json({
      message: "Invalid token payload.",
    });
  }

  try {
    // 6. Find the current user in MongoDB
    const user = await User.findById(decoded.id);

    // 7. Check whether the user still exists
    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists.",
      });
    }

    // 8. Check the user's current account status
    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account is inactive.",
      });
    }

    // 9. Attach the current user information to the request
    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    // 10. Continue to the next middleware or controller
    return next();
  } catch (error) {
    // An invalid MongoDB ID in the token
    if (error.name === "CastError") {
      return res.status(401).json({
        message: "Invalid token payload.",
      });
    }

    // Database or unexpected errors
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Failed to authenticate user.",
    });
  }
};

export default authenticateUser;
