import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const throwError = () => {
  throw new Error("JWT_SECRET is not defined");
};
const JWT_SECRET = process.env.JWT_SECRET ?? throwError();

export interface AuthenticatedAdminRequest extends Request {
  admin?: { email: string };
}

export const authenticateAdmin = (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    req.admin = { email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
