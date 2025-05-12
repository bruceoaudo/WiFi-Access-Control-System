import { db } from './db'
import {hashPassword} from './password'

export const validateAdminRegisterDetails = async (
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{
  userName: string;
  emailAddress: string;
  phoneNumber: string;
  hashedPassword: string;
}> => {
  if (!name || !email || !phone || !password) {
    throw new Error("All fields must be filled");
  }

  try {
    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Invalid phone number format");
    }

    const result = await db.query(
      `SELECT email FROM admin WHERE email = $1`,
      [email]
    );

    if (result.rows.length > 0) {
      throw new Error("Admin already registered.");
    }

    const hashedPassword = await hashPassword(password);

    return {
      userName: name,
      emailAddress: email,
      phoneNumber: phone,
      hashedPassword: hashedPassword,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
