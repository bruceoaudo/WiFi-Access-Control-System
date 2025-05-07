import { Request, Response, Router } from "express";
import { validateRegisterDetails } from "../utils/validate";
import { registerUser } from "../utils/registerUser";

const router = Router();

router.post('/register', (req: Request, res: Response) => {
    (async () => {
        try {
            const { name, phone, password, confirmPassword } = req.body;

            // Step 1–3: Validate inputs, user existence, and password
            const {userName, phoneNumber, hashedPassword } = await validateRegisterDetails(name, phone, password, confirmPassword);

            await registerUser(userName, phoneNumber, hashedPassword);

            return res.status(200).json({ message: "Registration successful" });
        } catch (err: any) {
            return res.status(401).json({ error: err.message || "Invalid credentials" });
        }
    })()
});

export default router;
