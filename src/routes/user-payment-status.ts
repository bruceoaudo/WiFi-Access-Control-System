import { Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authenticate-user";
import rateLimit from "express-rate-limit";
import axios from "axios";
import { accessToken, generatePassword, generateTimestamp } from "../utils";
import { db } from "../db";

const paymentStatusLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: { error: "Too many requests. Please slow down." },
});

const router = Router();

router.post(
  "/payment-status",
  authenticateUser,
  paymentStatusLimiter,
  async (req: Request, res: Response) => {
    const checkoutId = req.body.data;

    if (!checkoutId) {
      res.status(400).json({ error: "Missing checkout ID." });
      return;
    }

    const statusUrl =
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
    const maxRetries = 4;
    const delay = 5000; // 5 seconds

    try {
      const token = await accessToken();

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const timeStamp = generateTimestamp();
          const password = generatePassword(
            process.env.MPESA_BUSINESS_SHORTCODE!,
            process.env.MPESA_PASSKEY!,
            timeStamp
          );

          console.log(`Attempt ${attempt}: Sending MPESA query...`);

          const response = await axios.post(
            statusUrl,
            {
              BusinessShortCode: Number(process.env.MPESA_BUSINESS_SHORTCODE),
              Password: password,
              Timestamp: timeStamp,
              CheckoutRequestID: checkoutId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const result = response.data;
          console.log(`Attempt ${attempt}: MPESA response:`, result);

          // Handle Safaricom's "still processing" error code
          if (result.errorCode === "500.001.1001") {
            console.log(`Attempt ${attempt}: Still processing...`);
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            } else {
              res.status(202).json({
                message:
                  "Transaction still processing after multiple attempts.",
                data: result,
              });
              return;
            }
          }

          // Fixed typo: "RsultCode" -> "ResultCode"
          const resultCode = result.ResultCode;
          let status = "failed";
          if (resultCode === "0") {
            status = "success";
          } else if (resultCode === "1032") {
            status = "cancelled";
          }

          // Update DB
          await db.query(
            `UPDATE mpesa_payments SET status = $1 WHERE checkout_request_id = $2`,
            [status, checkoutId]
          );

          // Emit revenue update via socket.io
          const io = req.app.get("io");
          const todayRevenueResult = await db.query(
            `
            SELECT COALESCE(SUM(sp.cost), 0) AS total_revenue
            FROM mpesa_payments mp
            JOIN subscription_plan sp ON mp.plan_id = sp.plan_id
            WHERE DATE(mp.created_at) = CURRENT_DATE
              AND mp.status = 'success'
            `
          );

          io.emit("revenue_update", {
            total: todayRevenueResult.rows[0].total_revenue,
          });

          res.status(200).json({ data: result });
          return;
        } catch (err: any) {
          console.error(
            `Attempt ${attempt} failed:`,
            err.response?.data || err.message
          );
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            res.status(500).json({
              error: err.message,
              response: err.response?.data,
            });
            return;
          }
        }
      }
    } catch (error: any) {
      console.error(
        "MPESA Token Retrieval Failed:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
