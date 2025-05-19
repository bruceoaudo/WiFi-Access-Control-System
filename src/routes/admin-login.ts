import { Request, Response, Router } from "express";
import { validateAdminLoginDetails } from "../utils";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

router.post("/admin-login", (req: Request, res: Response) => {
  (async () => {
    try {
      const { email, password } = req.body;

      // Step 1–3: Validate inputs, user existence, and password
      const { emailAddress } = await validateAdminLoginDetails(email, password);

      // Step 4: Sign JWT token
      const token = jwt.sign({ email: emailAddress }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Step 5: Set token as HTTP-only cookie
      res.cookie("token", token, {
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
