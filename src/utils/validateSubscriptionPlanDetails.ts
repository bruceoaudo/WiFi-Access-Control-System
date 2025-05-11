import { db } from "./db";

export const validateSubscriptionPlanDetails = async (
  offer_name: string,
  offer_description: string,
  cost: string,
    time_duration: string,
  adminEmail: string
) => {
  // Check for empty inputs
  if (!offer_name || !offer_description || !cost || !time_duration || !adminEmail) {
    throw new Error("All fields must be filled");
  }

  try {

    // Retrieve user from database (use parameterized query)
    const result = await db.query(
      `SELECT EMAIL, PASSWORD FROM admin WHERE EMAIL = $1`,
      [adminEmail]
    );

    if (result.rows.length === 0) {
      throw new Error("Admin does not exist");
    }

    const admin = result.rows[0];

    // Return phone
    return {
        offerName:offer_name,
        offerDescription:offer_description,
        _cost:cost,
        timeDuration:time_duration,
        emailAddress:admin.email
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};