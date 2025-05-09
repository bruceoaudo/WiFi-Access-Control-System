import { adminPool } from "./db";
import { verifyPassword } from "./password";

export const validateAdminLoginDetails = async (email: string, password: string) => {
  // Check for empty inputs
  if (!email || !password) {
    throw new Error("All fields must be filled");
  }

  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Retrieve user from database (use parameterized query)
    const result = await adminPool.query(
      `SELECT EMAIL, PASSWORD FROM ADMIN WHERE EMAIL = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    const admin = result.rows[0];

    // Compare password to see if they match
    const isVerified = await verifyPassword(password, admin.password);

    if (!isVerified) {
      throw new Error("Invalid credentials");
    }

    // Return phone
    return {
      emailAddress: admin.email,
    };
  } catch (error: any) {
    throw new Error(error.message)
  }
};