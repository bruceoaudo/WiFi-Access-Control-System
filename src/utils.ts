import axios from "axios";
import { db } from "./db";
import argon2 from "argon2";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./erros";

const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch {
    return false;
  }
};

const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Use Argon2id for better security
    memoryCost: 2 ** 16, // 64 MB of memory (default is 4096 KiB = 2^12)
    timeCost: 3, // Number of iterations (default is 3)
    parallelism: 1, // Number of threads (default is 1)
  });
};

export const validateUserLoginDetails = async (
  phone: string,
  password: string
) => {
  // Check for empty inputs
  if (!phone || !password) {
    throw new BadRequestError("Please provide phone and password");
  }

  try {
    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestError("Please provide a valid phone number");
    }

    // Retrieve user from database (use parameterized query)
    const result = await db.query(
      `SELECT phonenumber, password FROM users WHERE phonenumber = $1`,
      [phone]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError("Incorrect phone number or password");
    }

    const user = result.rows[0];

    // Compare password to see if they match
    const isVerified = await verifyPassword(password, user.password);

    if (!isVerified) {
      throw new UnauthorizedError("Incorrect phone number or password");
    }

    // Return phone
    return {
      phoneNumber: user.phonenumber,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const validateRegisterDetails = async (
  name: string,
  phone: string,
  password: string,
  confirmPassword: string
): Promise<{
  userName: string;
  phoneNumber: string;
  hashedPassword: string;
}> => {
  if (!name || !phone || !password || !confirmPassword) {
    throw new Error("All fields must be filled");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  try {
    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Invalid phone number format");
    }

    const result = await db.query(
      `SELECT phonenumber FROM users WHERE phonenumber = $1`,
      [phone]
    );

    if (result.rows.length > 0) {
      throw new Error("User already registered.");
    }

    const hashedPassword = await hashPassword(password);

    return {
      userName: name,
      phoneNumber: phone,
      hashedPassword: hashedPassword,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const validateAdminLoginDetails = async (
  email: string,
  password: string
) => {
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
    const result = await db.query(
      `SELECT EMAIL, PASSWORD FROM admin WHERE EMAIL = $1`,
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
    throw new Error(error.message);
  }
};

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

    const result = await db.query(`SELECT email FROM admin WHERE email = $1`, [
      email,
    ]);

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

export const validateSubscriptionPlanDetails = async (
  offer_name: string,
  offer_description: string,
  cost: string,
  time_duration: string,
  adminEmail: string,
  is_popular: boolean,
  is_active: boolean,
  features: string[]
) => {
  // Trim inputs
  const name = offer_name.trim();
  const description = offer_description.trim();
  const duration = time_duration.trim();
  const email = adminEmail.trim();
  const parsedCost = parseFloat(cost);

  // Basic validation
  if (
    !name ||
    !description ||
    isNaN(parsedCost) ||
    !duration ||
    !email ||
    features.length === 0
  ) {
    throw new Error("All fields must be filled correctly");
  }

  if (parsedCost <= 0) {
    throw new Error("Cost must be a positive number");
  }

  try {
    // Get admin from DB with admin_id
    const result = await db.query(
      `SELECT admin_id, email FROM admin WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Admin does not exist");
    }

    const admin = result.rows[0];

    return {
      offerName: name,
      offerDescription: description,
      _cost: parsedCost,
      timeDuration: duration,
      adminId: admin.admin_id,
      popular: is_popular,
      active: is_active,
      _features: features,
    };
  } catch (error: any) {
    throw new Error(error.message || "Validation failed");
  }
};

export const registerUser = async (
  name: string,
  phone: string,
  password: string
) => {
  try {
    // Insert the new user
    await db.query(
      `INSERT INTO users (NAME, PHONENUMBER, PASSWORD) VALUES ($1, $2, $3)`,
      [name, phone, password]
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const registerAdmin = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    // Insert the new admin
    await db.query(
      `INSERT INTO admin (NAME, EMAIL, PHONENUMBER, PASSWORD) VALUES ($1, $2, $3, $4)`,
      [name, email, phone, password]
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createSubscriptionPlan = async (
  offerName: string,
  offerDescription: string,
  cost: number,
  timeDuration: string,
  features: string[],
  popular: boolean,
  active: boolean,
  adminId: string
) => {
  try {
    // Insert the subscription plan
    const planResult = await db.query(
      `INSERT INTO subscription_plan 
       (name, description, cost, duration, is_popular, is_active, admin_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING plan_id`,
      [
        offerName,
        offerDescription,
        cost,
        timeDuration,
        popular,
        active,
        adminId,
      ]
    );

    const planId = planResult.rows[0].plan_id;

    // Insert features
    if (features && features.length > 0) {
      for (const feature of features) {
        await db.query(
          `INSERT INTO plan_features (plan_id, feature) VALUES ($1, $2)`,
          [planId, feature]
        );
      }
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to create subscription plan");
  }
};

export const generatePassword = (
  shortcode: string,
  passkey: string,
  timestamp: string
): string => {
  const dataToEncode = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(dataToEncode).toString("base64");
};

export const generateTimestamp = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const generateAuthString = () => {
  const key = process.env.SAFARICOM_CONSUMER_KEY;
  const secret = process.env.SAFARICOM_CONSUMER_SECRET;
  const auth = `${key}:${secret}`;
  return Buffer.from(auth).toString("base64");
};

export const accessToken = async (): Promise<string> => {
  const authString = generateAuthString();

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${authString}`,
      },
    }
  );

  return response.data.access_token;
};
