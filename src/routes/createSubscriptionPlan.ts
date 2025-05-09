import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { validateSubscriptionPlanDetails } from "../utils/validateSubscriptionPlanDetails";
import { createSubscriptionPlan } from "../utils/createSubscriptionPlan";

const router = Router()

router.post('/create-plan', authenticateAdmin, (req: Request, res: Response) => {

    (async () => {

        const { offer_name, offer_description, cost, time_duration } = req.body

        try {
            const { email } = req.admin;

            const {
              offerName,
              offerDescription,
              _cost,
              timeDuration,
              emailAddress,
            } = await validateSubscriptionPlanDetails(
              offer_name,
              offer_description,
              cost,
              time_duration,
              email
            );

            // Create the subscription plan
            await createSubscriptionPlan(
              offerName,
              offerDescription,
              _cost,
              timeDuration,
              email
            );

            return res.status(200).json({ message: "Plan created successful" });
        } catch (err: any) {
            return res
              .status(401)
              .json({ error: err.message || "Invalid credentials" });
        }
    })()
    
})