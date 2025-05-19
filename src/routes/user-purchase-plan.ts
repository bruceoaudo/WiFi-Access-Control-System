import { Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authenticate-user";
import { db } from "../db";
import { accessToken } from "../utils";
import { generateTimestamp } from "../utils";
import { generatePassword } from "../utils";
import axios from "axios";

const router = Router();

router.post(
  "/purchase-plan",
  authenticateUser,
  (req: Request, res: Response) => {
    (async () => {
      try {
        const { plan_id } = req.body;

        const userId = req.user?.userId;
        const result = await db.query(
          `SELECT phonenumber FROM users WHERE user_id = $1`,
          [userId]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: "User does not exist" });
        }

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
        const customerPhone = "254" + result.rows[0].phonenumber?.substring(1);
        const password = generatePassword(
          process.env.MPESA_BUSINESS_SHORTCODE!,
          process.env.MPESA_PASSKEY!,
          timeStamp
        );

        const body = {
          BusinessShortCode: Number(process.env.MPESA_BUSINESS_SHORTCODE),
          Password: password,
          Timestamp: timeStamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Number(plan.rows[0].cost),
          PartyA: Number(customerPhone),
          PartyB: Number(process.env.MPESA_BUSINESS_SHORTCODE),
          PhoneNumber: Number(customerPhone),
          CallBackURL: process.env.MPESA_CALLBACK_URL!,
          AccountReference: "WiFi Access Control System",
          TransactionDesc: "Subscription payment",
        };

        const response = await axios.post(url, body, { headers });

        const checkoutRequestID = response.data.CheckoutRequestID;

        await db.query(
          `INSERT INTO mpesa_payments (user_id, plan_id, checkout_request_id, status) VALUES ($1, $2, $3, $4)`,
          [userId, plan_id, checkoutRequestID, "pending"]
        );

        res.status(200).json({
          message: "STK push sent",
          request_id: checkoutRequestID,
        });
      } catch (error: any) {
        console.error({ error });
        res.status(500).json({
          error: error.message || "Purchase failed",
        });
      }
    })();
  }
);

export default router;
