import pool from "./db";
import { verifyPassword } from "./password";

export const validateLoginDetails = async (phone: string, password: string) => {
  // Check for empty inputs
  if (!phone || !password) {
    throw new Error("All fields must be filled");
  }

  // Basic phone validation
  const phoneRegex = /^\d{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Invalid phone number format");
  }

  // Retrieve user from database (use parameterized query)
  const result = await pool.query(
    `SELECT PHONE, PASSWORD FROM USERS WHERE PHONE = $1`,
    [phone]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  // Compare password to see if they match
  const isVerified = await verifyPassword(password, user.password);

  if (!isVerified) {
    throw new Error("Invalid credentials");
  }

  // Return phone
  return {
    phoneNumber: user.phone,
  };
};
