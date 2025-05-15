import { Request, Response, Router } from "express";
import { accessToken } from "../utils/safaricom";
import { db } from "../db";
import { authenticateUser } from "../middlewares/authenticateUser";
import { generateTimestamp } from "../utils/generateTimestamp";
import { generatePassword } from "../utils/generatePassword";
import axios from "axios";

const router = Router();

router.post(
  "/purchase-plan",
  authenticateUser,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const { plan_id } = req.body;

        // Confirm if user exists first
        const userPhone = req.user?.phone;

        const result = await db.query(
          `SELECT phonenumber FROM users WHERE phonenumber = $1`,
          [userPhone]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: "User does not exist" });
        }

        // Validate plan exists
        const plan = await db.query(
          "SELECT * FROM subscription_plan WHERE plan_id = $1",
          [plan_id]
        );
        if (plan.rows.length === 0) {
          return res.status(404).json({ error: "Subscription plan not found" });
        }

        const token = await accessToken();

        const url =
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const timeStamp = generateTimestamp();

        const customerPhone = "254" + userPhone?.substring(1);

        const password = generatePassword(
          process.env.MPESA_BUSINESS_SHORTCODE!,
          process.env.MPESA_PASSKEY!,
          timeStamp
        );

        const body = {
          BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE, // Till number
          Password: password,
          Timestamp: timeStamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: "10",
          PartyA: customerPhone,
          PartyB: process.env.MPESA_BUSINESS_SHORTCODE, // Till number
          PhoneNumber: customerPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: "123456",
          TransactionDesc: "Testing",
        };

        const response = await axios.post(url, body, { headers });

        console.log("STK Push Response:", response.data);
      } catch (error: any) {
        console.log({ error });
        res.status(500).json({
          error: error.message || "Purchase failed",
        });
      }
    })();
  }
);

export default router;
