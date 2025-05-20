import { Request, Response, Router } from "express";
import { validateAdminLoginDetails } from "../utils";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db";

const router = Router();

// --- JWT Setup ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

router.post("/admin-login", (req: Request, res: Response) => {
  (async () => {
    try {
      const { email, password } = req.body;

      // Step 1: Validate inputs, user existence, and password
      const { adminId } = await validateAdminLoginDetails(email, password);

      // 2. Add JWT token metadata (iat, jti, and fingerprint)
      const fingerprint = crypto.randomUUID(); // helps identify the session
      const jti = crypto.randomUUID();

      // Save session to DB
      await db.query(
        "INSERT INTO admin_sessions (admin_id, fingerprint, jti) VALUES ($1, $2, $3)",
        [adminId, fingerprint, jti]
      );

      const tokenPayload = {
        sub: adminId,
        jti, // unique JWT ID to prevent replay
        fingerprint, // stored to cross-check if needed
      };

      // Step 4: Sign JWT token
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      // Step 5: Set token as HTTP-only cookie
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ message: "Login successful" });
    } catch (err: any) {
      return res
        .status(401)
        .json({ error: err.message || "Invalid credentials" });
    }
  })();
});

export default router;
