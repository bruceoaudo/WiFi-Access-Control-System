import { Request, Response, Router } from "express";
import { validateRegisterDetails } from "../utils";
import { registerUser } from "../utils";
import { io } from "..";
import { db } from "../db";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  (async () => {
    try {
      const { name, phone, password, confirmPassword } = req.body;

      // Step 1–3: Validate inputs, user existence, and password
      const { userName, phoneNumber, hashedPassword } =
        await validateRegisterDetails(name, phone, password, confirmPassword);

      await registerUser(userName, phoneNumber, hashedPassword);

      await db.query(`
      INSERT INTO daily_signups (signup_date, signup_count)
      VALUES (CURRENT_DATE, 1)
      ON CONFLICT (signup_date)
      DO UPDATE SET signup_count = daily_signups.signup_count + 1;
    `);

      // Get the updated count and emit to frontend
      const result = await db.query(
        `SELECT signup_count FROM daily_signups WHERE signup_date = CURRENT_DATE`
      );
      const todayCount = result.rows[0].signup_count;

      io.emit("register", {
        name: userName,
        phone: phoneNumber,
        count: todayCount,
      });

      return res.status(200).json({ message: "Registration successful" });
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  })();
});

export default router;
