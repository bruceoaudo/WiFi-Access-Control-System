import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const throwError = () => {
  throw new Error("JWT_SECRET is not defined");
};
const JWT_SECRET = process.env.JWT_SECRET ?? throwError();

export interface AuthenticatedAdminRequest extends Request {
  admin?: { email: string };
}

declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      email: string;
    };
  }
}

export const authenticateAdmin = (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: "Authentication token missing" });
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    req.admin = { email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
