import { Request, Response, Router } from "express";
import { db } from "../db";
import { authenticateAdmin } from "../middlewares/authenticate-admin";

const router = Router()

router.get("/profile", authenticateAdmin, (req: Request, res: Response) => {
    (async () => {
        try {
            const adminId = req.admin?.adminId;
            const result = await db.query(
              "SELECT name, email, phonenumber FROM admin WHERE admin_id = $1",
              [adminId]
            );
            res.json(result.rows[0]);
        } catch (error) {
            return res.status(500).json({error: "Failed to fetch count"})
        }
    })()
})

export default router