import { Router, Request, Response } from "express";
import { db } from "../db";
import { authenticateUser } from "../middlewares/authenticateUser";

const router = Router();

router.get(
  "/payment-status",
  authenticateUser,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const userPhone = req.user?.phone;

        const result = await db.query(
          `SELECT status FROM mpesa_payments WHERE user_phone = $1 ORDER BY created_at DESC LIMIT 1`,
          [userPhone]
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
