import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticate-admin";
import { db } from "../db";

const router = Router();

router.get(
  "/get-all-transactions",
  authenticateAdmin,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const adminId = req.admin?.adminId;

        // Confirm admin exists
        const adminResult = await db.query(
          "SELECT admin_id FROM admin WHERE admin_id = $1",
          [adminId]
        );

        if (adminResult.rows.length === 0) {
          return res.status(401).json({ error: "Admin does not exist" });
        }

        // Get all mpesa payments with user name and plan name
        const result = await db.query(`
            SELECT 
              mp.id AS payment_id,
              u.name AS username,
              u.phonenumber AS phone_number,
              sp.name AS plan_name,
              sp.cost::TEXT AS cost,
              mp.status,
              mp.created_at
            FROM mpesa_payments mp
            INNER JOIN users u ON mp.user_id = u.user_id
            INNER JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
            ORDER BY mp.created_at DESC;
          `);

        return res.status(200).json(result.rows);
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
          error: error.message || "Something went wrong. Try again later",
        });
      }
    })();
  }
);

export default router;
