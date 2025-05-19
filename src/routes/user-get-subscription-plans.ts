import { Request, Response, Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { db } from "../db";

const router = Router();

router.get("/get-plans", authenticateUser, (req: Request, res: Response) => {
  (async () => {
    try {
      // Confirm if user exists first
      const userPhone = req.user?.phone;

      const result = await db.query(
        `SELECT phonenumber FROM users WHERE phonenumber = $1`,
        [userPhone]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User does not exist" });
      }

      // Get all subscription plans with their features
      const plansResult = await db.query(`
            SELECT 
                sp.*,
                (
                    SELECT json_agg(pf.feature)
                    FROM plan_features pf
                    WHERE pf.plan_id = sp.plan_id
                ) as features
            FROM subscription_plan sp
        `);

      // Format the cost as string with 2 decimal places
      const formattedPlans = plansResult.rows.map((plan) => ({
        ...plan,
        cost: parseFloat(plan.cost).toFixed(2),
        features: plan.features || [], // Ensure features is always an array
      }));

      return res.status(200).json(formattedPlans);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Something went wrong. Try again later",
      });
    }
  })();
});

export default router;
