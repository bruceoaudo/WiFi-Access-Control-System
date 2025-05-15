import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { validateUserLoginDetails } from "../utils";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

router.post("/login", (req: Request, res: Response) => {
  (async () => {
    try {
      const { phone, password } = req.body;

      // Step 1–3: Validate inputs, user existence, and password
      const { phoneNumber } = await validateUserLoginDetails(phone, password);

      // Step 4: Sign JWT token
      const token = jwt.sign({ phone: phoneNumber }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Step 5: Set token as HTTP-only cookie
      res.cookie("user-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ message: "Login successful" });
    } catch (err: any) {
      return res
        .status(401)
        .json({ error: err.message || "Invalid credentials" });
    }
  })();
});

export default router;
