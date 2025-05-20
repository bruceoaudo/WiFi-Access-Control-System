import { Request, Response, Router } from "express";
import { authenticateUser } from "../middlewares/authenticate-user";
import { db } from "../db";

const router = Router();

router.get("/get-plans", authenticateUser, (req: Request, res: Response) => {
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

      const plansResult = await db.query(`
      SELECT 
        sp.*,
        (
          SELECT json_agg(pf.feature)
          FROM plan_features pf
          WHERE pf.plan_id = sp.plan_id
        ) AS features
      FROM subscription_plan sp
    `);

      const formattedPlans = plansResult.rows.map((plan) => ({
        ...plan,
        cost: parseFloat(plan.cost).toFixed(2),
        features: Array.isArray(plan.features) ? plan.features : [],
      }));

      return res.status(200).json(formattedPlans);
    } catch (error: any) {
      console.error("GET /get-plans error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })();
});

export default router;
