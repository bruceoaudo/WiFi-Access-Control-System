import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticate-admin";
import { db } from "../db";

const router = Router();

router.get(
  "/get-transactions",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    const {
      timeframe,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = parseInt(page as string, 10);
    const itemsPerPage = parseInt(limit as string, 10);
    const offset = (currentPage - 1) * itemsPerPage;

    const baseQuery = `
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
      // Get paginated data
      const dataQuery = `
        SELECT 
          mp.id AS payment_id,
          u.name AS username,
          u.phonenumber AS phone_number,
          sp.name AS plan_name,
          CAST(sp.cost AS FLOAT) AS cost,
          mp.status,
          mp.created_at
        ${baseQuery}
        ${whereClause}
        ORDER BY mp.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const result = await db.query(dataQuery, [
        ...params,
        itemsPerPage,
        offset,
      ]);

      // Get graph data with proper grouping
      let graphQuery: string;
      let graphParams: any[] = [];
      const isCustomTimeframe = timeframe === "custom" && startDate && endDate;

      if (timeframe === "daily") {
        graphQuery = `
          SELECT 
            mp.created_at AS date,
            CAST(sp.cost AS FLOAT) AS cost
          FROM mpesa_payments mp
          JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
          WHERE mp.status = 'success'
          ${
            isCustomTimeframe
              ? `AND mp.created_at BETWEEN $1 AND $2`
              : `AND mp.created_at >= NOW() - INTERVAL '1 day'`
          }
          ORDER BY mp.created_at ASC
        `;
      } else if (timeframe === "weekly") {
        graphQuery = `
          SELECT 
            DATE(mp.created_at) AS date,
            SUM(CAST(sp.cost AS FLOAT)) AS cost
          FROM mpesa_payments mp
          JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
          WHERE mp.status = 'success'
          ${
            isCustomTimeframe
              ? `AND mp.created_at BETWEEN $1 AND $2`
              : `AND mp.created_at >= NOW() - INTERVAL '7 days'`
          }
          GROUP BY DATE(mp.created_at)
          ORDER BY DATE(mp.created_at) ASC
        `;
      } else {
        // monthly
        graphQuery = `
          SELECT 
            DATE_TRUNC('week', mp.created_at) AS date,
            SUM(CAST(sp.cost AS FLOAT)) AS cost
          FROM mpesa_payments mp
          JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
          WHERE mp.status = 'success'
          ${
            isCustomTimeframe
              ? `AND mp.created_at BETWEEN $1 AND $2`
              : `AND mp.created_at >= NOW() - INTERVAL '30 days'`
          }
          GROUP BY DATE_TRUNC('week', mp.created_at)
          ORDER BY DATE_TRUNC('week', mp.created_at) ASC
        `;
      }

      if (isCustomTimeframe) {
        graphParams = [startDate, endDate];
      }

      const graphResult = await db.query(graphQuery, graphParams);

      // Format the graph data
      let dates: string[] = [];
      const costs: number[] = graphResult.rows.map((row) => row.cost);

      if (timeframe === "weekly") {
        dates = graphResult.rows.map((row) =>
          new Date(row.date).toLocaleDateString("en-US", { weekday: "long" })
        );
      } else if (timeframe === "monthly") {
        dates = graphResult.rows.map((_, index) => `Week ${index + 1}`);
      } else {
        dates = graphResult.rows.map((row) => row.date);
      }

      const graphData = {
          dates,
          costs,
          timeframe,
      }

      res.json({
        data: result.rows,
        total: result.rows.length,
        graphData: graphData,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
