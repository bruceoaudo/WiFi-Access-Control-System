import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const throwError = () => {
  throw new Error("JWT_SECRET is not defined");
};
const JWT_SECRET = process.env.JWT_SECRET ?? throwError();

export interface AuthenticatedUserRequest extends Request {
  user?: { phone: string };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      phone: string;
    };
  }
}

export const authenticateUser = (
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

    const decoded = jwt.verify(token, JWT_SECRET) as { phone: string };

    req.user = { phone: decoded.phone };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
