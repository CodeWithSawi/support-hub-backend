import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import User from "../models/User.js";

// ==========================================
// REGISTER USER
// ==========================================
const register = async (req, res) => {
  try {
    // 1. Extract registration details from the request body.
    let { name, email, password } = req.body ?? {};

    // 2. Check that all required fields are provided.
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    // 3. Validate the data types.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password must be strings.",
      });
    }

    // 4. Normalize user input.
    name = name.trim();
    email = email.trim().toLowerCase();

    // 5. Check for empty name and email.
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email cannot be empty.",
      });
    }

    // 6. Validate email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    // 7. Validate password.
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

    // 8. Check whether this email already exists in MongoDB.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // 9. Hash the password before saving it.
    const hashedPassword = await hashPassword(password);

    // 10. Create the user document in MongoDB.
    // MongoDB automatically generates the _id.
    // Mongoose automatically generates createdAt and updatedAt.
    // We explicitly assign customer so public registration
    // cannot create an admin or support agent account.
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      accountStatus: "active",
    });

    // 11. Convert the Mongoose document into a plain object
    // and remove the password before sending the response.
    const { password: userPassword, ...userWithoutPassword } =
      newUser.toObject();

    return res.status(201).json({
      message: "User registered successfully.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // 12. Handle MongoDB duplicate-key errors.
    // This also protects against two registration requests
    // attempting to use the same email simultaneously.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // 13. Handle Mongoose validation errors.
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "An unexpected error occurred during registration.",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
const login = async (req, res) => {
  try {
    // 1. Extract login details.
    const { email, password } = req.body ?? {};

    // 2. Check required fields.
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 3. Validate data types.
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password must be strings.",
      });
    }

    // 4. Normalize email.
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email cannot be empty.",
      });
    }

    // 5. Find the user in MongoDB.
    // Remember that our User schema has select: false
    // on the password field.
    // .select("+password") tells Mongoose to include it
    // for this particular login query.
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // 6. Check whether the user exists.
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 7. Check whether the account is active.
    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // 8. Compare the supplied password with the stored hash.
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 9. Generate a JWT.
    // MongoDB uses _id instead of our previous custom id.
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // 10. Remove the password before sending the response.
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

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
