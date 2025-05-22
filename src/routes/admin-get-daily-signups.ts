import { Request, Response, Router } from "express";
import { db } from "../db";

const router = Router()

router.get("/daily-signups", (req: Request, res: Response) => {
    (async () => {
        try {
            const result = await db.query(`
            SELECT signup_count FROM daily_signups WHERE signup_date = CURRENT_DATE
            `);
            return res.json({ count: result.rows[0]?.signup_count || 0 });
        } catch (error) {
            return res.status(500).json({error: "Failed to fetch count"})
        }
    })()
})

export default router