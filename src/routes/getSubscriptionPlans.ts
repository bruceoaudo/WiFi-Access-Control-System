import { Request, Response, Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { db } from "../utils/db";

const router = Router()

router.get('/get-plans', authenticateUser, (req: Request, res: Response) => {

    (async () => {
        try {
                // Confirm if admin exists first
                const userPhone = req.user?.phone
        
                const result = await db.query(`SELECT phone FROM users WHERE phonenumber = $1`, [userPhone]);
        
                 if (result.rows.length === 0) {
                   return res.status(401).json({error: "User does not exist"})
                 }
                
                // Get all subscription plans
                const plans = await db.query(
                        `SELECT * FROM subscription_plan`
                );
        
                 return res.status(200).json(plans)
                } catch (error:any) {
                    res
                      .status(500)
                      .json({ error: error.message || "Something went wrong. Try again later" });
                }
    })()
    
})