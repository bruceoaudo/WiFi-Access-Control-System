import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { db } from "../utils/db";

const router = Router()

router.get('/get-plans', authenticateAdmin, (req: Request, res: Response) => {

    (async () => {

        try {
        // Confirm if admin exists first
        const email = req.admin?.email

        const result = await db.query(`SELECT email FROM admin WHERE email = $1`, [email]);

         if (result.rows.length === 0) {
           return res.status(401).json({error: "Admin does not exist"})
         }
        
        // Get all subscription plans
        const plans = await db.query(
                `SELECT * FROM subscription_plan`
        );

            return res.status(200).json(plans.rows)
        } catch (error:any) {
            res
              .status(500)
              .json({ error: error.message || "Something went wrong. Try again later" });
        }
    })()
    
})

export default router