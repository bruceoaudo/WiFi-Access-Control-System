import { Request, Response, Router } from "express";
import { registerAdmin } from "../utils/registerAdmin";
import { validateAdminRegisterDetails } from "../utils/validateAdminRegisterDetails";

const router = Router();

router.post("/admin-register", (req: Request, res: Response) => {
  (async () => {
    try {
      const { name, email, phone, password } = req.body;

      // Step 1–3: Validate inputs, user existence, and password
      const { userName, emailAddress, phoneNumber, hashedPassword } =
        await validateAdminRegisterDetails(name, email, phone, password);

      await registerAdmin(userName, emailAddress, phoneNumber, hashedPassword);

      return res.status(200).json({ message: "Registration successful" });
    } catch (err: any) {
      return res
        .status(401)
        .json({ error: err.message || "Invalid credentials" });
    }
  })();
});

export default router;
