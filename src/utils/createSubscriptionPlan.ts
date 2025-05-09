import { subscriptionPlanPool } from "./db";


export const createSubscriptionPlan = async (
  offerName: string,
  offerDescription: string,
  _cost: string,
  timeDuration: string,
  email: string
) => {
  try {
    // Insert the new user
    await subscriptionPlanPool.query(
      `INSERT INTO SUBSCRIPTION_PLAN (NAME, DESCRIPTION, COST, DURATION, ADMIN) VALUES ($1, $2, $3, $4, $5)`,
      [offerName, offerDescription, _cost, timeDuration, email]
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};