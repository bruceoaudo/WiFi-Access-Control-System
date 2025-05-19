import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";

const throwError = () => {
  throw new Error("JWT_SECRET is not defined");
};
const JWT_SECRET = process.env.JWT_SECRET ?? throwError();

export interface AuthenticatedUserRequest extends Request {
  user?: { userId: string };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
    };
  }
}

export const authenticateUser = async (
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.user_token;

    if (!token) {
      res.status(401).json({ error: "Authentication token missing" });
      return
    }

    // Decode JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      jti: string;
      fingerprint: string;
    };

    // Verify token exists in the session store
    const { rows } = await db.query(
      "SELECT * FROM user_sessions WHERE user_id = $1 AND fingerprint = $2 AND revoked = false",
      [decoded.sub, decoded.fingerprint]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid or revoked session" });
      return
    }

    req.user = { userId: decoded.sub };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};