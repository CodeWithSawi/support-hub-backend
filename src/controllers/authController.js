import jwt from "jsonwebtoken";
import "dotenv/config";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { users } from "../data/data.js";

const currentDate = () => new Date().toISOString();

const register = async (req, res) => {
  try {
    // 1. Extract registration details
    let { name, email, password } = req.body;

    // 2. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    // 3. Normalize user input
    name = name.trim();
    email = email.trim().toLowerCase();

    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    // 5. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // 6. Check whether the email already exists
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email,
    );

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // 7. Hash the password
    const hashedPassword = await hashPassword(password);

    // 8. Generate a new user ID
    const lastUser = users[users.length - 1];
    const newId = lastUser ? `u${Number(lastUser.id.slice(1)) + 1}` : "u1";

    // 9. Generate timestamps
    const timestamp = currentDate();

    // 10. Create the new user
    const newUser = {
      id: newId,
      name,
      email,
      password: hashedPassword,
      role: "customer",
      accountStatus: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 11. Save the user
    users.push(newUser);

    // 12. Remove password before sending response
    const { password: userPassword, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: "User registered successfully.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred during registration.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  const normalizeEmail = email.trim().toLowerCase();

  const user = users.find(
    (user) => user.email.toLowerCase() === normalizeEmail,
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  if (!user.password) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  // Remove password before sending response
  const { password: userPassword, ...userWithoutPassword } = user;

  return res.status(200).json({
    message: "Login successful.",
    token: token,
    user: userWithoutPassword,
  });
};

export { register, login };
