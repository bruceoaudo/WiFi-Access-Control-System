import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticate-admin";
import { db } from "../db";

const router = Router();

router.get(
  "/get-transactions",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    const { timeframe, startDate, endDate } = req.query;
    let query = `
      SELECT 
        mp.id AS payment_id,
        u.name AS username,
        u.phonenumber AS phone_number,
        sp.name AS plan_name,
        CAST(sp.cost AS FLOAT) AS cost,
        mp.status,
        mp.created_at
      FROM mpesa_payments mp
      JOIN users u ON mp.user_id = u.user_id
      JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
    `;

    const params: any[] = [];
    let whereClause = "";

    if (timeframe === "custom" && startDate && endDate) {
      whereClause = `WHERE mp.created_at BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    } else {
      let days = 1;
      if (timeframe === "weekly") days = 7;
      else if (timeframe === "monthly") days = 30;

      whereClause = `WHERE mp.created_at >= NOW() - INTERVAL '${days} days'`;
    }

    try {
      const result = await db.query(
        `${query} ${whereClause} ORDER BY mp.created_at DESC`,
        params
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
