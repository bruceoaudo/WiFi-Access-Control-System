import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { db } from "../db";

const router = Router();

router.get("/get-plans", authenticateAdmin, (req: Request, res: Response) => {
  (async () => {
    try {
      // Confirm if admin exists first
      const email = req.admin?.email;

      const adminResult = await db.query(
        `SELECT email FROM admin WHERE email = $1`,
        [email]
      );

      if (adminResult.rows.length === 0) {
        return res.status(401).json({ error: "Admin does not exist" });
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
      res
        .status(500)
        .json({
          error: error.message || "Something went wrong. Try again later",
        });
    }
  })();
});

export default router;
