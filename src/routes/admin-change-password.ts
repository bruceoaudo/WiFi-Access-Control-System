import { Request, Response, Router } from "express";
import { db } from "../db";
import { authenticateAdmin } from "../middlewares/authenticate-admin";
import { verifyPassword } from "../utils";
import { hashPassword } from "../utils";

const router = Router();

router.post(
  "/change-password",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    const adminId = req.admin?.adminId;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "All fields must be filled." });
      return;
    }

    if (confirmNewPassword !== newPassword) {
      res.status(400).json({ error: "New passwords do not match." });
      return;
    }

    if (currentPassword === newPassword) {
      res
        .status(400)
        .json({ error: "Old password cannot be the same as new password" });
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      res
        .status(400)
        .json({
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, and number",
        });
    }

    if (!adminId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      // 1. Fetch admin account
      const result = await db.query(
        `SELECT password FROM admin WHERE admin_id = $1`,
        [adminId]
      );

      const admin = result.rows[0];
      if (!admin) {
        res.status(404).json({ error: "Admin not found" });
        return;
      }

      // 2. Verify current password
      const passwordMatches = await verifyPassword(
        currentPassword,
        admin.password
      );

      if (!passwordMatches) {
        res.status(400).json({ error: "Incorrect current password" });
        return;
      }

      // 3. Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // 4. Update password
      await db.query(`UPDATE admin SET password = $1 WHERE admin_id = $2`, [
        hashedPassword,
        adminId,
      ]);

      res.status(200).json({ message: "Password updated successfully" });
      return;
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
