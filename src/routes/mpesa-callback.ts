import { Request, Response, Router } from "express";
import { db } from "../db";

const router = Router()

router.post("/callback", (req: Request, res: Response) => {
    (async () => {

        try {

            console.log(
              "M-Pesa Callback Request Body:",
              JSON.stringify(req.body, null, 2)
            );
            
            const body = req.body;
            const callback = body.Body?.stkCallback;

            const checkoutRequestID = callback?.CheckoutRequestID;
            const resultCode = callback?.ResultCode;

            let status = "failed";
            if (resultCode === 0) {
                status = "success";
            } else if (resultCode === 1032) {
                status = "cancelled";
            }

            await db.query(
                `UPDATE mpesa_payments SET status = $1 WHERE checkout_request_id = $2`,
                [status, checkoutRequestID]
            );

            res.sendStatus(200);
        } catch (error) {
            console.error("Callback error:", error);
            res.sendStatus(500);
        }
    })()
});

export default router