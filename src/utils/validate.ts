import { userPool } from "./db";
import { hashPassword, verifyPassword } from "./password";

export const validateLoginDetails = async (phone: string, password: string) => {
  
  // Check for empty inputs
  if (!phone || !password) {
    throw new Error("All fields must be filled");
  }

  try {
    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Invalid phone number format");
    }

    // Retrieve user from database (use parameterized query)
    const result = await userPool.query(
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
  } catch (error: any) {
    throw new Error(error.message)
  }
};



export const validateRegisterDetails = async (
  name: string,
  phone: string,
  password: string,
  confirmPassword: string
): Promise<{
  userName: string
  phoneNumber: string
  hashedPassword: string
}> => {
  if (!name || !phone || !password || !confirmPassword) {
    throw new Error("All fields must be filled");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  try {
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Invalid phone number format");
    }

    const result = await userPool.query(
      `SELECT PHONE FROM USERS WHERE PHONE = $1`,
      [phone]
    );

    if (result.rows.length > 0) {
      throw new Error("User with this phone number is already registered.");
    }

    const hashedPassword = await hashPassword(password);

    return {
      userName: name,
      phoneNumber: phone,
      hashedPassword: hashedPassword
    }

  } catch (error: any) {
    throw new Error(error.message)
  }
};      
