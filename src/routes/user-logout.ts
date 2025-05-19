import { Router, Response } from "express";
import { AuthenticatedUserRequest, authenticateUser } from "../middlewares/authenticate-user";
import jwt from "jsonwebtoken";
import { db } from "../db";

const router = Router()
 
const throwError = () => {
  throw new Error("JWT_SECRET is not defined");
};
const JWT_SECRET = process.env.JWT_SECRET ?? throwError();

router.post(
  "/logout",
  authenticateUser,
    (req: AuthenticatedUserRequest, res: Response) => {
        (async () => {
            try {
                const token = req.cookies.user_token;
                const decoded = jwt.verify(token, JWT_SECRET) as {
                    sub: string;
                    jti: string;
                    fingerprint: string;
                };

                await db.query(
                    "UPDATE user_sessions SET revoked = true WHERE user_id = $1 AND fingerprint = $2 AND jti = $3",
                    [decoded.sub, decoded.fingerprint, decoded.jti]
                );

                res.clearCookie("user_token");
                res.status(200).json({ message: "Logged out successfully" });
            } catch (err) {
                res.status(400).json({ error: "Logout failed" });
            }
        })()
    }
);


export default router