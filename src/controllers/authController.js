import jwt from "jsonwebtoken";
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

    // 3. Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password must be strings.",
      });
    }

    // 4. Normalize user input
    name = name.trim();
    email = email.trim().toLowerCase();

    // 5. Validate empty name and email
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email cannot be empty.",
      });
    }

    // 6. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    // 7. Validate password
    if (!password.trim()) {
      return res.status(400).json({
        message: "Password cannot contain only whitespace.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // 8. Check whether the email already exists
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email,
    );

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // 9. Hash the password
    const hashedPassword = await hashPassword(password);

    // 10. Generate a new user ID
    const lastUser = users[users.length - 1];
    const newId = lastUser ? `u${Number(lastUser.id.slice(1)) + 1}` : "u1";

    // 11. Generate timestamps
    const timestamp = currentDate();

    // 12. Create the new user
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

    // 13. Save the user
    users.push(newUser);

    // 14. Remove password before sending response
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
  try {
    // 1. Extract login details
    const { email, password } = req.body;

    // 2. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 3. Validate input types
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password must be strings.",
      });
    }

    // 4. Normalize email
    const normalizeEmail = email.trim().toLowerCase();

    if (!normalizeEmail) {
      return res.status(400).json({
        message: "Email cannot be empty.",
      });
    }

    // 5. Find user
    const user = users.find(
      (user) => user.email.toLowerCase() === normalizeEmail,
    );

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 6. Check account status
    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // 7. Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 8. Generate JWT
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

    // 9. Remove password before sending response
    const { password: userPassword, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred during login.",
    });
  }
};

export { register, login };
