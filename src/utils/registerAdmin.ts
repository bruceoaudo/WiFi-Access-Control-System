import { db } from "./db";

export const registerAdmin = async (name:string, email: string, phone:string, password:string) => {
    try {
      // Insert the new admin
      await db.query(
        `INSERT INTO admin (NAME, EMAIL, PHONENUMBER, PASSWORD) VALUES ($1, $2, $3, $4)`,
        [name, email, phone, password]
      );
    } catch (error: any) {
        throw new Error(error.message)
    }
}