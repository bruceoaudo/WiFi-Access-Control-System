import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { validateUserLoginDetails } from "../utils";
import crypto from "crypto";
import { db } from "../db";

const router = Router();

// --- JWT Setup ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

// --- Login Route ---
router.post("/login", (req: Request, res: Response) => {
  (async () => {
    try {
      const { phone, password } = req.body;

      // 1. Sanitize and validate login details
      const { userId } = await validateUserLoginDetails(phone, password);

      // 2. Add JWT token metadata (iat, jti, and fingerprint)
      const fingerprint = crypto.randomUUID(); // helps identify the session
      const jti = crypto.randomUUID();

      // Save session to DB
      await db.query(
        "INSERT INTO user_sessions (user_id, fingerprint, jti) VALUES ($1, $2, $3)",
        [userId, fingerprint, jti]
      );
      const tokenPayload = {
        sub: userId,
        jti, // unique JWT ID to prevent replay
        fingerprint, // stored to cross-check if needed
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      // 3. Set cookie with secure options
      res.cookie("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ message: "Login successful" });
    } catch (err: any) {

      console.error("Login error:", err.message);

      return res
        .status(401)
        .json({ error: err.message });
    }
  })();
});

export default router;
