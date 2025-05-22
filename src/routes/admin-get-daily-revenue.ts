import { Request, Response, Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/daily-revenue", (req: Request, res: Response) => {
  (async () => {
    try {
      const result = await db.query(
        `
      SELECT COALESCE(SUM(sp.cost), 0) AS total_revenue
      FROM mpesa_payments mp
      JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
      WHERE DATE(mp.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi') = CURRENT_DATE
        AND mp.status = 'success'
      `
      );

      res.status(200).json({ total: result.rows[0].total_revenue });
    } catch (error) {
      console.error("Failed to fetch daily revenue:", error);
      res.status(500).json({ error: "Failed to fetch daily revenue" });
    }
  })();
});

export default router;
