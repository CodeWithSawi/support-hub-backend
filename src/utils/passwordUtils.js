// passwordUtils.js

import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  // Generate a salt. Why? A salt is a random string that is added to the password before hashing. It helps to protect against rainbow table attacks and ensures that even if two users have the same password, their hashed passwords will be different.
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt. The hash function takes the password and the salt as inputs and produces a hashed version of the password.
  const hashedPassword = await bcrypt.hash(password, salt);

  // Return the hashed password. This is the value that will be stored in the database instead of the plain text password.
  return hashedPassword;
};

// Compare a plain text password with a hashed password. This function is used during login to verify that the provided password matches the stored hashed password.
const comparePassword = async (password, hashedPassword) => {
  // Use bcrypt's compare function to check if the plain text password matches the hashed password. This function takes care of hashing the plain text password with the same salt and comparing it to the hashed password.
  return await bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
