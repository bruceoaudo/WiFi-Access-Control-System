import { Request, Response, Router } from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { validateSubscriptionPlanDetails } from "../utils";
import { createSubscriptionPlan } from "../utils";

const router = Router();

router.post(
  "/create-plan",
  authenticateAdmin,
  (req: Request, res: Response) => {
    (async () => {
      const {
        offer_name,
        offer_description,
        cost,
        duration,
        features,
        is_popular,
        is_active,
      } = req.body;

      try {
        const email = req.admin?.email || "";

        const { offerName, offerDescription, _cost, timeDuration, adminId, popular, active, _features } =
          await validateSubscriptionPlanDetails(
            offer_name,
            offer_description,
            cost,
            duration,
            email,
            is_popular,
            is_active,
            features
          );

        // Create the subscription plan
        await createSubscriptionPlan(
          offerName,
          offerDescription,
          _cost,
          timeDuration,
          _features,
          popular,
          active,
          adminId
        );

        return res.status(200).json({ message: "Plan created successfully" });
      } catch (err: any) {
        return res
          .status(400)
          .json({ message: err.message || "Failed to create subscription plan" });
      }
    })()
  }
);

export default router;
