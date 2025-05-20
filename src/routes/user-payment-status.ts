import { Router, Request, Response } from "express";
import { db } from "../db";
import { authenticateUser } from "../middlewares/authenticate-user";
import rateLimit from "express-rate-limit";

const paymentStatusLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many requests. Please slow down." },
});

const router = Router();

router.get(
  "/payment-status",
  authenticateUser,
  paymentStatusLimiter,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const userId = req.user?.userId;

        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const userResult = await db.query(
          `SELECT phonenumber FROM users WHERE user_id = $1`,
          [userId]
        );

        if (userResult.rows.length === 0) {
          return res.status(401).json({ error: "User does not exist" });
        }

        const result = await db.query(
          `SELECT status FROM mpesa_payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ status: "not_found" });
        }

        return res.status(200).json({ status: result.rows[0].status });
      } catch (error: any) {
        console.error("Payment status error:", error);
        res.status(500).json({ error: "Failed to fetch payment status" });
      }
    })();
  }
);

export default router;
